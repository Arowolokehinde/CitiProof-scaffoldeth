// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CitizenIdentityRegistry.sol";

/**
 * @title ReputationSystem
 * @dev Manages citizen reputation scores based on verified activities
 * @author CitiProof Team
 */
contract ReputationSystem is Ownable, ReentrancyGuard {
    
    // Reference to CitizenIdentityRegistry
    CitizenIdentityRegistry public immutable citizenRegistry;

    // Reputation scoring configuration
    struct ReputationConfig {
        uint256 issueReportReward;      // Points for verified issue reports
        uint256 verificationReward;     // Points for successful verifications
        uint256 votingReward;          // Points for participation in voting
        uint256 projectCompletionReward; // Points for project milestone completion
        uint256 falseReportPenalty;    // Penalty for false/spam reports
        uint256 maxDailyEarnings;      // Max points per day to prevent gaming
        uint256 decayRate;             // Daily reputation decay (in basis points)
        uint256 minimumDecayThreshold; // Minimum reputation before decay applies
    }

    ReputationConfig public config;

    // Reputation tracking
    struct ReputationData {
        uint256 totalScore;
        uint256 lastUpdateTimestamp;
        uint256 dailyEarnings;
        uint256 lastEarningsReset;
        mapping(bytes32 => bool) actionCompleted; // Prevent double rewards
        uint256 totalReports;
        uint256 verifiedReports;
        uint256 totalVerifications;
        uint256 successfulVerifications;
        uint256 votingParticipation;
    }

    // Storage
    mapping(uint256 => ReputationData) private reputationData; // citizenId => ReputationData
    mapping(address => bool) public authorizedContracts; // Contracts allowed to update reputation

    // Events
    event ReputationUpdated(
        uint256 indexed citizenId,
        address indexed citizen,
        uint256 oldScore,
        uint256 newScore,
        string reason
    );

    event ReputationConfigUpdated(
        uint256 issueReportReward,
        uint256 verificationReward,
        uint256 votingReward,
        uint256 projectCompletionReward
    );

    event ContractAuthorized(address indexed contractAddress, bool authorized);

    // Modifiers
    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender], "ReputationSystem: Caller not authorized");
        _;
    }

    modifier validCitizenId(uint256 _citizenId) {
        require(_citizenId > 0, "ReputationSystem: Invalid citizen ID");
        // Additional validation by getting citizen profile
        try citizenRegistry.getCitizen(_citizenId) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            require(profile.isActive, "ReputationSystem: Citizen not active");
        } catch {
            revert("ReputationSystem: Citizen does not exist");
        }
        _;
    }

    constructor(
        address initialOwner,
        address _citizenRegistry
    ) Ownable(initialOwner) {
        require(_citizenRegistry != address(0), "ReputationSystem: Invalid citizen registry address");
        citizenRegistry = CitizenIdentityRegistry(_citizenRegistry);

        // Initialize default configuration
        config = ReputationConfig({
            issueReportReward: 50,        // 50 points per verified report
            verificationReward: 25,       // 25 points per verification
            votingReward: 10,            // 10 points per vote
            projectCompletionReward: 100, // 100 points per project milestone
            falseReportPenalty: 75,      // -75 points for false reports
            maxDailyEarnings: 200,       // Max 200 points per day
            decayRate: 10,               // 0.1% daily decay (10 basis points)
            minimumDecayThreshold: 100   // No decay below 100 points
        });
    }

    /**
     * @dev Add reputation points for verified issue report
     */
    function addIssueReportReputation(uint256 _citizenId, bytes32 _reportId) 
        external 
        onlyAuthorizedContract 
        validCitizenId(_citizenId) 
    {
        bytes32 actionId = keccak256(abi.encodePacked("issue_report", _reportId));
        require(!reputationData[_citizenId].actionCompleted[actionId], 
                "ReputationSystem: Reward already claimed for this report");

        _addReputation(_citizenId, config.issueReportReward, "Verified issue report");
        reputationData[_citizenId].actionCompleted[actionId] = true;
        reputationData[_citizenId].totalReports++;
        reputationData[_citizenId].verifiedReports++;
    }

    /**
     * @dev Add reputation points for successful verification
     */
    function addVerificationReputation(uint256 _citizenId, bytes32 _verificationId) 
        external 
        onlyAuthorizedContract 
        validCitizenId(_citizenId) 
    {
        bytes32 actionId = keccak256(abi.encodePacked("verification", _verificationId));
        require(!reputationData[_citizenId].actionCompleted[actionId], 
                "ReputationSystem: Reward already claimed for this verification");

        _addReputation(_citizenId, config.verificationReward, "Successful verification");
        reputationData[_citizenId].actionCompleted[actionId] = true;
        reputationData[_citizenId].totalVerifications++;
        reputationData[_citizenId].successfulVerifications++;
    }

    /**
     * @dev Add reputation points for voting participation
     */
    function addVotingReputation(uint256 _citizenId, bytes32 _voteId) 
        external 
        onlyAuthorizedContract 
        validCitizenId(_citizenId) 
    {
        bytes32 actionId = keccak256(abi.encodePacked("vote", _voteId));
        require(!reputationData[_citizenId].actionCompleted[actionId], 
                "ReputationSystem: Reward already claimed for this vote");

        _addReputation(_citizenId, config.votingReward, "Voting participation");
        reputationData[_citizenId].actionCompleted[actionId] = true;
        reputationData[_citizenId].votingParticipation++;
    }

    /**
     * @dev Add reputation points for project completion
     */
    function addProjectCompletionReputation(uint256 _citizenId, bytes32 _projectId) 
        external 
        onlyAuthorizedContract 
        validCitizenId(_citizenId) 
    {
        bytes32 actionId = keccak256(abi.encodePacked("project", _projectId));
        require(!reputationData[_citizenId].actionCompleted[actionId], 
                "ReputationSystem: Reward already claimed for this project");

        _addReputation(_citizenId, config.projectCompletionReward, "Project milestone completion");
        reputationData[_citizenId].actionCompleted[actionId] = true;
    }

    /**
     * @dev Penalize reputation for false reports
     */
    function penalizeFalseReport(uint256 _citizenId, bytes32 _reportId) 
        external 
        onlyAuthorizedContract 
        validCitizenId(_citizenId) 
    {
        bytes32 actionId = keccak256(abi.encodePacked("false_report", _reportId));
        require(!reputationData[_citizenId].actionCompleted[actionId], 
                "ReputationSystem: Penalty already applied for this report");

        _subtractReputation(_citizenId, config.falseReportPenalty, "False report penalty");
        reputationData[_citizenId].actionCompleted[actionId] = true;
        reputationData[_citizenId].totalReports++;
        // Note: verifiedReports count remains unchanged
    }

    /**
     * @dev Apply daily reputation decay to prevent inflation
     */
    function applyDailyDecay(uint256[] calldata _citizenIds) external {
        for (uint256 i = 0; i < _citizenIds.length; i++) {
            _applyDecay(_citizenIds[i]);
        }
    }

    /**
     * @dev Internal function to add reputation with daily limits
     */
    function _addReputation(uint256 _citizenId, uint256 _points, string memory _reason) internal {
        ReputationData storage data = reputationData[_citizenId];
        
        // Reset daily earnings if it's a new day
        if (block.timestamp > data.lastEarningsReset + 1 days) {
            data.dailyEarnings = 0;
            data.lastEarningsReset = block.timestamp;
        }

        // Check daily earning limits
        uint256 actualPoints = _points;
        if (data.dailyEarnings + _points > config.maxDailyEarnings) {
            actualPoints = config.maxDailyEarnings > data.dailyEarnings ? 
                           config.maxDailyEarnings - data.dailyEarnings : 0;
        }

        if (actualPoints > 0) {
            uint256 oldScore = data.totalScore;
            data.totalScore += actualPoints;
            data.dailyEarnings += actualPoints;
            data.lastUpdateTimestamp = block.timestamp;

            // Update citizen registry with new score
            citizenRegistry.updateReputationScore(_citizenId, data.totalScore);

            // Get citizen address from registry
            address citizenAddress = address(0);
            try citizenRegistry.getCitizen(_citizenId) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
                citizenAddress = profile.walletAddress;
            } catch {}
            
            emit ReputationUpdated(_citizenId, citizenAddress, oldScore, data.totalScore, _reason);
        }
    }

    /**
     * @dev Internal function to subtract reputation
     */
    function _subtractReputation(uint256 _citizenId, uint256 _points, string memory _reason) internal {
        ReputationData storage data = reputationData[_citizenId];
        uint256 oldScore = data.totalScore;
        
        // Ensure reputation doesn't go below 0
        if (data.totalScore >= _points) {
            data.totalScore -= _points;
        } else {
            data.totalScore = 0;
        }
        
        data.lastUpdateTimestamp = block.timestamp;

        // Update citizen registry with new score
        citizenRegistry.updateReputationScore(_citizenId, data.totalScore);

        // Get citizen address from registry
        address citizenAddress = address(0);
        try citizenRegistry.getCitizen(_citizenId) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            citizenAddress = profile.walletAddress;
        } catch {}
        emit ReputationUpdated(_citizenId, citizenAddress, oldScore, data.totalScore, _reason);
    }

    /**
     * @dev Apply reputation decay for inactive users
     */
    function _applyDecay(uint256 _citizenId) internal validCitizenId(_citizenId) {
        ReputationData storage data = reputationData[_citizenId];
        
        // Only apply decay if above minimum threshold and it's been at least a day
        if (data.totalScore > config.minimumDecayThreshold && 
            block.timestamp > data.lastUpdateTimestamp + 1 days) {
            
            uint256 daysSinceUpdate = (block.timestamp - data.lastUpdateTimestamp) / 1 days;
            uint256 decayAmount = (data.totalScore * config.decayRate * daysSinceUpdate) / 10000;
            
            if (decayAmount > 0) {
                _subtractReputation(_citizenId, decayAmount, "Daily reputation decay");
            }
        }
    }

    // View functions
    function getReputationScore(uint256 _citizenId) external view validCitizenId(_citizenId) returns (uint256) {
        return reputationData[_citizenId].totalScore;
    }

    function getReputationStats(uint256 _citizenId) 
        external 
        view 
        validCitizenId(_citizenId) 
        returns (
            uint256 totalScore,
            uint256 totalReports,
            uint256 verifiedReports,
            uint256 totalVerifications,
            uint256 successfulVerifications,
            uint256 votingParticipation,
            uint256 lastUpdateTimestamp
        ) 
    {
        ReputationData storage data = reputationData[_citizenId];
        return (
            data.totalScore,
            data.totalReports,
            data.verifiedReports,
            data.totalVerifications,
            data.successfulVerifications,
            data.votingParticipation,
            data.lastUpdateTimestamp
        );
    }

    function getDailyEarningsInfo(uint256 _citizenId) 
        external 
        view 
        validCitizenId(_citizenId) 
        returns (uint256 dailyEarnings, uint256 remainingEarnings, uint256 lastReset) 
    {
        ReputationData storage data = reputationData[_citizenId];
        uint256 remaining = config.maxDailyEarnings > data.dailyEarnings ? 
                           config.maxDailyEarnings - data.dailyEarnings : 0;
        
        return (data.dailyEarnings, remaining, data.lastEarningsReset);
    }

    function getTopReputationCitizens(uint256 _limit) 
        external 
        view 
        returns (uint256[] memory citizenIds, uint256[] memory scores) 
    {
        uint256 totalCitizens = citizenRegistry.getTotalCitizens();
        if (_limit > totalCitizens) _limit = totalCitizens;
        
        citizenIds = new uint256[](_limit);
        scores = new uint256[](_limit);
        uint256 count = 0;
        
        // Simple implementation - collect first _limit active citizens with scores
        for (uint256 i = 1; i <= totalCitizens && count < _limit; i++) {
            try citizenRegistry.getCitizen(i) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
                if (profile.isActive) {
                    citizenIds[count] = i;
                    scores[count] = reputationData[i].totalScore;
                    count++;
                }
            } catch {
                // Skip invalid citizens
                continue;
            }
        }
        
        return (citizenIds, scores);
    }

    // Admin functions
    function updateConfig(
        uint256 _issueReportReward,
        uint256 _verificationReward,
        uint256 _votingReward,
        uint256 _projectCompletionReward,
        uint256 _falseReportPenalty,
        uint256 _maxDailyEarnings,
        uint256 _decayRate,
        uint256 _minimumDecayThreshold
    ) external onlyOwner {
        config.issueReportReward = _issueReportReward;
        config.verificationReward = _verificationReward;
        config.votingReward = _votingReward;
        config.projectCompletionReward = _projectCompletionReward;
        config.falseReportPenalty = _falseReportPenalty;
        config.maxDailyEarnings = _maxDailyEarnings;
        config.decayRate = _decayRate;
        config.minimumDecayThreshold = _minimumDecayThreshold;

        emit ReputationConfigUpdated(
            _issueReportReward,
            _verificationReward,
            _votingReward,
            _projectCompletionReward
        );
    }

    function authorizeContract(address _contract, bool _authorized) external onlyOwner {
        require(_contract != address(0), "ReputationSystem: Invalid contract address");
        authorizedContracts[_contract] = _authorized;
        emit ContractAuthorized(_contract, _authorized);
    }

    function emergencyResetReputation(uint256 _citizenId, uint256 _newScore) external onlyOwner {
        ReputationData storage data = reputationData[_citizenId];
        uint256 oldScore = data.totalScore;
        data.totalScore = _newScore;
        data.lastUpdateTimestamp = block.timestamp;

        citizenRegistry.updateReputationScore(_citizenId, _newScore);

        // Get citizen address from registry
        address citizenAddress = address(0);
        try citizenRegistry.getCitizen(_citizenId) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            citizenAddress = profile.walletAddress;
        } catch {}
        emit ReputationUpdated(_citizenId, citizenAddress, oldScore, _newScore, "Emergency reset");
    }
}