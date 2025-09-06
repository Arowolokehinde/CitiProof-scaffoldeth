// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CitizenIdentityRegistry.sol";
import "./ReputationSystem.sol";

/**
 * @title IssueReportingSystem
 * @dev Manages citizen-submitted reports and verification process
 * @author CitiProof Team
 */
contract IssueReportingSystem is Ownable, ReentrancyGuard {
    
    CitizenIdentityRegistry public immutable citizenRegistry;
    ReputationSystem public reputationSystem;
    
    // Issue severity levels
    enum IssueSeverity {
        LOW,        // Minor issues, cosmetic problems
        MEDIUM,     // Moderate impact on community
        HIGH,       // Significant impact, urgent attention needed
        CRITICAL    // Emergency, immediate action required
    }
    
    // Issue status tracking
    enum IssueStatus {
        SUBMITTED,      // Newly submitted by citizen
        UNDER_REVIEW,   // Being reviewed by authorities
        VERIFIED,       // Confirmed as legitimate issue
        IN_PROGRESS,    // Work started to address the issue
        RESOLVED,       // Issue has been addressed
        REJECTED,       // Issue deemed invalid/false
        DUPLICATE       // Duplicate of existing issue
    }
    
    // Issue categories
    enum IssueCategory {
        INFRASTRUCTURE,     // Roads, bridges, utilities
        PUBLIC_SAFETY,      // Crime, dangerous conditions
        ENVIRONMENT,        // Pollution, waste management
        CORRUPTION,         // Government misconduct, fraud
        SERVICE_QUALITY,    // Poor government services
        BUDGET_MISUSE,      // Improper use of public funds
        TRANSPARENCY,       // Lack of information disclosure
        OTHER
    }
    
    // Evidence structure
    struct Evidence {
        string evidenceHash; // IPFS hash
        string ipfsDescriptionHash; // IPFS hash for evidence description
        uint256 timestamp;
        address submittedBy;
        bool isVerified;
    }
    
    // Issue report structure
    struct IssueReport {
        uint256 reportId;
        uint256 citizenId;
        address reporter;
        string title; // Keep on-chain for indexing
        string ipfsDescriptionHash; // IPFS hash for detailed description
        IssueCategory category;
        IssueSeverity severity;
        IssueStatus status;
        string ipfsLocationDataHash; // IPFS hash for location details
        uint256 submitTimestamp;
        uint256 lastUpdateTimestamp;
        uint256 verificationScore; // Weighted verification score
        uint256 supportCount; // Number of citizens supporting this report
        address assignedTo; // Government entity assigned to handle
        string ipfsResolutionNotesHash; // IPFS hash for resolution details
        uint256 resolutionTimestamp;
        bool isAnonymous;
        uint256 duplicateOfReportId; // If marked as duplicate
        string[] tags; // Searchable tags (keep on-chain for filtering)
    }
    
    // Verification vote structure
    struct VerificationVote {
        uint256 citizenId;
        address voter;
        bool isSupporting; // true = supports report validity, false = disputes
        string ipfsCommentsHash; // IPFS hash for detailed comments
        uint256 timestamp;
        uint256 voterReputationAtTime; // Voter's reputation when vote was cast
    }
    
    // Storage
    uint256 private _reportIdCounter;
    mapping(uint256 => IssueReport) public reports;
    mapping(uint256 => Evidence[]) public reportEvidence; // reportId => Evidence[]
    mapping(uint256 => VerificationVote[]) public reportVerifications; // reportId => VerificationVote[]
    mapping(uint256 => mapping(uint256 => bool)) public hasVotedOnReport; // reportId => citizenId => voted
    mapping(uint256 => mapping(uint256 => bool)) public hasSupportedReport; // reportId => citizenId => supported
    mapping(address => bool) public authorizedGovernmentEntities;
    mapping(uint256 => uint256[]) public categoryReports; // category => reportIds
    mapping(address => uint256[]) public citizenReports; // citizen address => reportIds
    mapping(bytes32 => uint256[]) public locationReports; // location hash => reportIds
    
    // Configuration
    uint256 public minimumVerificationScore = 100; // Minimum score to mark as verified
    uint256 public verificationThreshold = 3; // Minimum verification votes needed
    uint256 public duplicateThreshold = 80; // Similarity threshold for duplicates (in percentage)
    
    // Events
    event IssueReported(
        uint256 indexed reportId,
        uint256 indexed citizenId,
        address indexed reporter,
        IssueCategory category,
        IssueSeverity severity
    );
    
    event IssueStatusUpdated(
        uint256 indexed reportId,
        IssueStatus previousStatus,
        IssueStatus newStatus,
        address indexed updatedBy
    );
    
    event IssueVerificationVote(
        uint256 indexed reportId,
        uint256 indexed citizenId,
        address indexed voter,
        bool isSupporting,
        uint256 voterReputation
    );
    
    event EvidenceAdded(
        uint256 indexed reportId,
        string evidenceHash,
        address indexed submittedBy
    );
    
    event IssueAssigned(
        uint256 indexed reportId,
        address indexed assignedTo,
        address indexed assignedBy
    );
    
    event IssueResolved(
        uint256 indexed reportId,
        address indexed resolvedBy,
        string resolutionNotes
    );
    
    event IssueDuplicate(
        uint256 indexed reportId,
        uint256 indexed duplicateOfReportId,
        address indexed markedBy
    );
    
    // Modifiers
    modifier onlyRegisteredCitizen() {
        require(citizenRegistry.isCitizenRegistered(msg.sender), 
                "IssueReporting: Must be registered citizen");
        _;
    }
    
    modifier onlyAuthorizedGovernment() {
        require(authorizedGovernmentEntities[msg.sender], 
                "IssueReporting: Not authorized government entity");
        _;
    }
    
    modifier validReportId(uint256 _reportId) {
        require(_reportId > 0 && _reportId <= _reportIdCounter, 
                "IssueReporting: Invalid report ID");
        _;
    }
    
    modifier onlyReportOwnerOrGov(uint256 _reportId) {
        require(
            reports[_reportId].reporter == msg.sender || 
            authorizedGovernmentEntities[msg.sender] || 
            msg.sender == owner(),
            "IssueReporting: Not authorized to modify this report"
        );
        _;
    }
    
    constructor(
        address initialOwner,
        address _citizenRegistry,
        address _reputationSystem
    ) Ownable(initialOwner) {
        require(_citizenRegistry != address(0), "IssueReporting: Invalid citizen registry");
        require(_reputationSystem != address(0), "IssueReporting: Invalid reputation system");
        
        citizenRegistry = CitizenIdentityRegistry(_citizenRegistry);
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Submit a new issue report
     */
    function submitIssueReport(
        string memory _title,
        string memory _ipfsDescriptionHash,
        IssueCategory _category,
        IssueSeverity _severity,
        string memory _ipfsLocationDataHash,
        string memory _evidenceHash,
        string[] memory _tags,
        bool _isAnonymous
    ) external onlyRegisteredCitizen nonReentrant {
        require(bytes(_title).length > 0, "IssueReporting: Title cannot be empty");
        require(bytes(_ipfsDescriptionHash).length > 0, "IssueReporting: IPFS description hash required");
        require(_tags.length <= 10, "IssueReporting: Too many tags");
        
        // Get citizen ID - using try/catch for safety
        uint256 citizenId = 0;
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            citizenId = profile.citizenId;
        } catch {
            revert("IssueReporting: Failed to get citizen ID");
        }
        
        _reportIdCounter++;
        uint256 newReportId = _reportIdCounter;
        
        // Create report
        reports[newReportId] = IssueReport({
            reportId: newReportId,
            citizenId: citizenId,
            reporter: _isAnonymous ? address(0) : msg.sender,
            title: _title,
            ipfsDescriptionHash: _ipfsDescriptionHash,
            category: _category,
            severity: _severity,
            status: IssueStatus.SUBMITTED,
            ipfsLocationDataHash: _ipfsLocationDataHash,
            submitTimestamp: block.timestamp,
            lastUpdateTimestamp: block.timestamp,
            verificationScore: 0,
            supportCount: 0,
            assignedTo: address(0),
            ipfsResolutionNotesHash: "",
            resolutionTimestamp: 0,
            isAnonymous: _isAnonymous,
            duplicateOfReportId: 0,
            tags: _tags
        });
        
        // Add to mappings
        categoryReports[uint256(_category)].push(newReportId);
        if (!_isAnonymous) {
            citizenReports[msg.sender].push(newReportId);
        }
        
        // Add location to mapping if provided
        if (bytes(_ipfsLocationDataHash).length > 0) {
            bytes32 locationHash = keccak256(abi.encodePacked(_ipfsLocationDataHash));
            locationReports[locationHash].push(newReportId);
        }
        
        // Add evidence if provided
        if (bytes(_evidenceHash).length > 0) {
            reportEvidence[newReportId].push(Evidence({
                evidenceHash: _evidenceHash,
                ipfsDescriptionHash: "", // Can be added later
                timestamp: block.timestamp,
                submittedBy: msg.sender,
                isVerified: false
            }));
            
            emit EvidenceAdded(newReportId, _evidenceHash, msg.sender);
        }
        
        emit IssueReported(newReportId, citizenId, _isAnonymous ? address(0) : msg.sender, _category, _severity);
    }
    
    /**
     * @dev Add evidence to existing report
     */
    function addEvidence(
        uint256 _reportId,
        string memory _evidenceHash,
        string memory _ipfsDescriptionHash
    ) external onlyRegisteredCitizen validReportId(_reportId) {
        require(bytes(_evidenceHash).length > 0, "IssueReporting: Evidence hash cannot be empty");
        require(bytes(_ipfsDescriptionHash).length > 0, "IssueReporting: IPFS description hash required");
        
        IssueReport storage report = reports[_reportId];
        require(report.status != IssueStatus.RESOLVED && report.status != IssueStatus.REJECTED, 
                "IssueReporting: Cannot add evidence to closed report");
        
        reportEvidence[_reportId].push(Evidence({
            evidenceHash: _evidenceHash,
            ipfsDescriptionHash: _ipfsDescriptionHash,
            timestamp: block.timestamp,
            submittedBy: msg.sender,
            isVerified: false
        }));
        
        report.lastUpdateTimestamp = block.timestamp;
        
        emit EvidenceAdded(_reportId, _evidenceHash, msg.sender);
    }
    
    /**
     * @dev Vote to verify/support an issue report
     */
    function verifyReport(
        uint256 _reportId,
        bool _isSupporting,
        string memory _ipfsCommentsHash
    ) external onlyRegisteredCitizen validReportId(_reportId) {
        // Get citizen ID - using try/catch for safety
        uint256 citizenId = 0;
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            citizenId = profile.citizenId;
        } catch {
            revert("IssueReporting: Failed to get citizen ID");
        }
        require(!hasVotedOnReport[_reportId][citizenId], "IssueReporting: Already voted on this report");
        require(reports[_reportId].citizenId != citizenId, "IssueReporting: Cannot vote on own report");
        
        IssueReport storage report = reports[_reportId];
        require(report.status == IssueStatus.SUBMITTED || report.status == IssueStatus.UNDER_REVIEW, 
                "IssueReporting: Report not open for verification");
        
        // Get voter's current reputation score
        uint256 voterReputation = 100; // Default reputation
        try reputationSystem.getReputationScore(citizenId) returns (uint256 reputation) {
            voterReputation = reputation;
        } catch {}
        
        // Record verification vote
        reportVerifications[_reportId].push(VerificationVote({
            citizenId: citizenId,
            voter: msg.sender,
            isSupporting: _isSupporting,
            ipfsCommentsHash: _ipfsCommentsHash,
            timestamp: block.timestamp,
            voterReputationAtTime: voterReputation
        }));
        
        hasVotedOnReport[_reportId][citizenId] = true;
        
        // Update verification score (weighted by reputation)
        uint256 voteWeight = _calculateVoteWeight(voterReputation);
        if (_isSupporting) {
            report.verificationScore += voteWeight;
            report.supportCount++;
        } else {
            // Negative votes reduce the score
            if (report.verificationScore >= voteWeight) {
                report.verificationScore -= voteWeight;
            } else {
                report.verificationScore = 0;
            }
        }
        
        report.lastUpdateTimestamp = block.timestamp;
        
        // Auto-verify if thresholds are met
        if (report.verificationScore >= minimumVerificationScore && 
            reportVerifications[_reportId].length >= verificationThreshold &&
            report.status == IssueStatus.SUBMITTED) {
            
            report.status = IssueStatus.VERIFIED;
            emit IssueStatusUpdated(_reportId, IssueStatus.SUBMITTED, IssueStatus.VERIFIED, address(this));
            
            // Award reputation to reporter if verified
            bytes32 reportHash = keccak256(abi.encodePacked("report", _reportId));
            try reputationSystem.addIssueReportReputation(report.citizenId, reportHash) {} catch {}
        }
        
        emit IssueVerificationVote(_reportId, citizenId, msg.sender, _isSupporting, voterReputation);
    }
    
    /**
     * @dev Update issue status (government entities only)
     */
    function updateIssueStatus(
        uint256 _reportId,
        IssueStatus _newStatus,
        string memory _ipfsNotesHash
    ) external onlyAuthorizedGovernment validReportId(_reportId) {
        IssueReport storage report = reports[_reportId];
        IssueStatus previousStatus = report.status;
        
        require(previousStatus != _newStatus, "IssueReporting: Status unchanged");
        require(_isValidStatusTransition(previousStatus, _newStatus), 
                "IssueReporting: Invalid status transition");
        
        report.status = _newStatus;
        report.lastUpdateTimestamp = block.timestamp;
        
        // Handle resolution
        if (_newStatus == IssueStatus.RESOLVED) {
            report.ipfsResolutionNotesHash = _ipfsNotesHash;
            report.resolutionTimestamp = block.timestamp;
        }
        
        // Handle assignment
        if (_newStatus == IssueStatus.IN_PROGRESS && report.assignedTo == address(0)) {
            report.assignedTo = msg.sender;
            emit IssueAssigned(_reportId, msg.sender, msg.sender);
        }
        
        // Penalize false reports
        if (_newStatus == IssueStatus.REJECTED && report.citizenId != 0) {
            bytes32 reportHash = keccak256(abi.encodePacked("false_report", _reportId));
            try reputationSystem.penalizeFalseReport(report.citizenId, reportHash) {} catch {}
        }
        
        emit IssueStatusUpdated(_reportId, previousStatus, _newStatus, msg.sender);
        
        if (_newStatus == IssueStatus.RESOLVED) {
            emit IssueResolved(_reportId, msg.sender, _ipfsNotesHash);
        }
    }
    
    /**
     * @dev Assign issue to government entity
     */
    function assignIssue(
        uint256 _reportId,
        address _assignee
    ) external onlyAuthorizedGovernment validReportId(_reportId) {
        require(authorizedGovernmentEntities[_assignee], "IssueReporting: Assignee not authorized");
        
        IssueReport storage report = reports[_reportId];
        require(report.status == IssueStatus.VERIFIED || report.status == IssueStatus.UNDER_REVIEW, 
                "IssueReporting: Report must be verified or under review");
        
        report.assignedTo = _assignee;
        report.lastUpdateTimestamp = block.timestamp;
        
        emit IssueAssigned(_reportId, _assignee, msg.sender);
    }
    
    /**
     * @dev Mark report as duplicate
     */
    function markAsDuplicate(
        uint256 _reportId,
        uint256 _originalReportId
    ) external onlyAuthorizedGovernment validReportId(_reportId) validReportId(_originalReportId) {
        require(_reportId != _originalReportId, "IssueReporting: Cannot mark as duplicate of itself");
        require(reports[_originalReportId].status != IssueStatus.REJECTED, 
                "IssueReporting: Original report is rejected");
        
        IssueReport storage report = reports[_reportId];
        IssueStatus previousStatus = report.status;
        
        report.status = IssueStatus.DUPLICATE;
        report.duplicateOfReportId = _originalReportId;
        report.lastUpdateTimestamp = block.timestamp;
        
        // Increase support count for original report
        reports[_originalReportId].supportCount++;
        
        emit IssueStatusUpdated(_reportId, previousStatus, IssueStatus.DUPLICATE, msg.sender);
        emit IssueDuplicate(_reportId, _originalReportId, msg.sender);
    }
    
    // View functions
    function getReport(uint256 _reportId) external view validReportId(_reportId) returns (IssueReport memory) {
        return reports[_reportId];
    }
    
    function getReportEvidence(uint256 _reportId) external view validReportId(_reportId) returns (Evidence[] memory) {
        return reportEvidence[_reportId];
    }
    
    function getReportVerifications(uint256 _reportId) external view validReportId(_reportId) returns (VerificationVote[] memory) {
        return reportVerifications[_reportId];
    }
    
    function getReportsByCategory(IssueCategory _category) external view returns (uint256[] memory) {
        return categoryReports[uint256(_category)];
    }
    
    function getCitizenReports(address _citizen) external view returns (uint256[] memory) {
        return citizenReports[_citizen];
    }
    
    function getReportsByStatus(IssueStatus _status) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count reports with status
        for (uint256 i = 1; i <= _reportIdCounter; i++) {
            if (reports[i].status == _status) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _reportIdCounter; i++) {
            if (reports[i].status == _status) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    function getReportStats() external view returns (
        uint256 totalReports,
        uint256 verifiedReports,
        uint256 resolvedReports,
        uint256 pendingReports
    ) {
        uint256 verified = 0;
        uint256 resolved = 0;
        uint256 pending = 0;
        
        for (uint256 i = 1; i <= _reportIdCounter; i++) {
            IssueStatus status = reports[i].status;
            
            if (status == IssueStatus.VERIFIED) verified++;
            else if (status == IssueStatus.RESOLVED) resolved++;
            else if (status == IssueStatus.SUBMITTED || status == IssueStatus.UNDER_REVIEW || status == IssueStatus.IN_PROGRESS) {
                pending++;
            }
        }
        
        return (_reportIdCounter, verified, resolved, pending);
    }
    
    function getTotalReports() external view returns (uint256) {
        return _reportIdCounter;
    }
    
    // Internal functions
    function _calculateVoteWeight(uint256 _reputation) internal pure returns (uint256) {
        // Base weight of 10, with bonus based on reputation
        // Higher reputation citizens have more influence
        if (_reputation >= 1000) return 50;      // High reputation
        else if (_reputation >= 500) return 30; // Medium reputation
        else if (_reputation >= 100) return 20; // Basic reputation
        else return 10;                          // New/low reputation
    }
    
    function _isValidStatusTransition(IssueStatus _from, IssueStatus _to) internal pure returns (bool) {
        if (_from == IssueStatus.SUBMITTED) {
            return _to == IssueStatus.UNDER_REVIEW || _to == IssueStatus.VERIFIED || 
                   _to == IssueStatus.REJECTED || _to == IssueStatus.DUPLICATE;
        } else if (_from == IssueStatus.UNDER_REVIEW) {
            return _to == IssueStatus.VERIFIED || _to == IssueStatus.REJECTED || 
                   _to == IssueStatus.DUPLICATE || _to == IssueStatus.IN_PROGRESS;
        } else if (_from == IssueStatus.VERIFIED) {
            return _to == IssueStatus.IN_PROGRESS || _to == IssueStatus.REJECTED;
        } else if (_from == IssueStatus.IN_PROGRESS) {
            return _to == IssueStatus.RESOLVED || _to == IssueStatus.UNDER_REVIEW;
        }
        return false; // RESOLVED, REJECTED, DUPLICATE are final states
    }
    
    // Admin functions
    function authorizeGovernmentEntity(address _entity, bool _authorized) external onlyOwner {
        require(_entity != address(0), "IssueReporting: Invalid entity address");
        authorizedGovernmentEntities[_entity] = _authorized;
    }
    
    function updateVerificationThresholds(
        uint256 _minimumScore,
        uint256 _verificationThreshold
    ) external onlyOwner {
        require(_minimumScore > 0, "IssueReporting: Minimum score must be positive");
        require(_verificationThreshold > 0, "IssueReporting: Verification threshold must be positive");
        
        minimumVerificationScore = _minimumScore;
        verificationThreshold = _verificationThreshold;
    }
    
    function updateReputationSystem(address _reputationSystem) external onlyOwner {
        require(_reputationSystem != address(0), "IssueReporting: Invalid reputation system");
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    function emergencyUpdateReportStatus(
        uint256 _reportId,
        IssueStatus _status
    ) external onlyOwner validReportId(_reportId) {
        IssueStatus previousStatus = reports[_reportId].status;
        reports[_reportId].status = _status;
        reports[_reportId].lastUpdateTimestamp = block.timestamp;
        
        emit IssueStatusUpdated(_reportId, previousStatus, _status, msg.sender);
    }
}