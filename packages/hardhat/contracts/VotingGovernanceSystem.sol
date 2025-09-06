// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CitizenIdentityRegistry.sol";
import "./ReputationSystem.sol";
import "./GovernmentProjectRegistry.sol";

/**
 * @title VotingGovernanceSystem
 * @dev Enables community voting on governance matters
 * @author CitiProof Team
 */
contract VotingGovernanceSystem is Ownable, ReentrancyGuard {
    
    CitizenIdentityRegistry public immutable citizenRegistry;
    ReputationSystem public reputationSystem;
    GovernmentProjectRegistry public projectRegistry;
    
    enum ProposalType {
        PROJECT_APPROVAL,    // Vote on new project proposals
        BUDGET_ALLOCATION,   // Vote on budget changes
        POLICY_CHANGE,       // Vote on governance policy updates
        ISSUE_PRIORITY,      // Vote on issue priority/urgency
        OTHER
    }
    
    enum ProposalStatus {
        ACTIVE,      // Currently accepting votes
        PASSED,      // Proposal passed and executed
        REJECTED,    // Proposal failed to meet threshold
        EXPIRED,     // Voting period ended without resolution
        CANCELLED    // Cancelled by creator or admin
    }
    
    struct Proposal {
        uint256 proposalId;
        uint256 creatorCitizenId;
        address creator;
        string title;
        string ipfsDescriptionHash; // IPFS hash for detailed description
        ProposalType proposalType;
        ProposalStatus status;
        uint256 creationTimestamp;
        uint256 votingEndTimestamp;
        uint256 executionTimestamp;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 totalVotingPower;
        uint256 quorumRequired;
        uint256 passingThreshold; // Percentage needed to pass (basis points)
        bytes executionData; // Data for automatic execution
        string ipfsDocumentHash; // Additional proposal documents
        bool isExecuted;
        uint256 relatedProjectId; // If related to a specific project
    }
    
    struct Vote {
        uint256 citizenId;
        address voter;
        bool support; // true = yes, false = no
        uint256 votingPower; // Based on reputation at time of vote
        uint256 timestamp;
        string reason; // Optional reason for vote
    }
    
    // Storage
    uint256 private _proposalIdCounter;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Vote[]) public proposalVotes; // proposalId => Vote[]
    mapping(uint256 => mapping(uint256 => bool)) public hasVoted; // proposalId => citizenId => voted
    mapping(address => uint256[]) public citizenProposals; // creator => proposalIds
    mapping(uint256 => uint256[]) public typeProposals; // proposalType => proposalIds
    
    // Configuration
    uint256 public defaultVotingPeriod = 7 days;
    uint256 public minimumQuorum = 1000; // Minimum total voting power required
    uint256 public defaultPassingThreshold = 5100; // 51% in basis points
    uint256 public minimumReputationToPropose = 100;
    uint256 public minimumReputationToVote = 50;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed creatorCitizenId,
        address indexed creator,
        ProposalType proposalType,
        string title
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        uint256 indexed citizenId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        ProposalStatus finalStatus,
        uint256 yesVotes,
        uint256 noVotes
    );
    
    event ProposalStatusChanged(
        uint256 indexed proposalId,
        ProposalStatus oldStatus,
        ProposalStatus newStatus
    );
    
    // Modifiers
    modifier onlyRegisteredCitizen() {
        require(citizenRegistry.isCitizenRegistered(msg.sender), "Voting: Must be registered citizen");
        _;
    }
    
    modifier validProposalId(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= _proposalIdCounter, "Voting: Invalid proposal ID");
        _;
    }
    
    modifier onlyProposalCreator(uint256 _proposalId) {
        require(proposals[_proposalId].creator == msg.sender, "Voting: Not proposal creator");
        _;
    }
    
    modifier proposalActive(uint256 _proposalId) {
        require(proposals[_proposalId].status == ProposalStatus.ACTIVE, "Voting: Proposal not active");
        require(block.timestamp <= proposals[_proposalId].votingEndTimestamp, "Voting: Voting period ended");
        _;
    }
    
    constructor(
        address initialOwner,
        address _citizenRegistry,
        address _reputationSystem,
        address _projectRegistry
    ) Ownable(initialOwner) {
        require(_citizenRegistry != address(0), "Voting: Invalid citizen registry");
        require(_reputationSystem != address(0), "Voting: Invalid reputation system");
        require(_projectRegistry != address(0), "Voting: Invalid project registry");
        
        citizenRegistry = CitizenIdentityRegistry(_citizenRegistry);
        reputationSystem = ReputationSystem(_reputationSystem);
        projectRegistry = GovernmentProjectRegistry(_projectRegistry);
    }
    
    /**
     * @dev Create a new governance proposal (simplified to avoid stack too deep)
     */
    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _proposalType,
        uint256 _votingPeriod,
        uint256 _relatedProjectId
    ) external onlyRegisteredCitizen nonReentrant {
        require(bytes(_title).length > 0, "Voting: Title cannot be empty");
        require(bytes(_description).length > 10, "Voting: Description too short");
        
        // Get creator's citizen ID and check reputation
        uint256 creatorCitizenId = 0;
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            creatorCitizenId = profile.citizenId;
            require(profile.reputationScore >= minimumReputationToPropose, "Voting: Insufficient reputation");
        } catch {
            revert("Voting: Failed to get citizen profile");
        }
        
        _proposalIdCounter++;
        uint256 newProposalId = _proposalIdCounter;
        
        proposals[newProposalId] = Proposal({
            proposalId: newProposalId,
            creatorCitizenId: creatorCitizenId,
            creator: msg.sender,
            title: _title,
            ipfsDescriptionHash: _description,
            proposalType: _proposalType,
            status: ProposalStatus.ACTIVE,
            creationTimestamp: block.timestamp,
            votingEndTimestamp: block.timestamp + (_votingPeriod > 0 ? _votingPeriod : defaultVotingPeriod),
            executionTimestamp: 0,
            yesVotes: 0,
            noVotes: 0,
            totalVotingPower: 0,
            quorumRequired: minimumQuorum,
            passingThreshold: defaultPassingThreshold,
            executionData: "",
            ipfsDocumentHash: "",
            isExecuted: false,
            relatedProjectId: _relatedProjectId
        });
        
        citizenProposals[msg.sender].push(newProposalId);
        typeProposals[uint256(_proposalType)].push(newProposalId);
        
        emit ProposalCreated(newProposalId, creatorCitizenId, msg.sender, _proposalType, _title);
    }
    
    /**
     * @dev Cast vote on a proposal
     */
    function castVote(
        uint256 _proposalId,
        bool _support,
        string memory _reason
    ) external onlyRegisteredCitizen validProposalId(_proposalId) proposalActive(_proposalId) {
        // Get voter's citizen ID and reputation
        uint256 voterCitizenId = 0;
        uint256 voterReputation = 0;
        
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            voterCitizenId = profile.citizenId;
            voterReputation = profile.reputationScore;
        } catch {
            revert("Voting: Failed to get citizen profile");
        }
        
        require(voterReputation >= minimumReputationToVote, "Voting: Insufficient reputation to vote");
        require(!hasVoted[_proposalId][voterCitizenId], "Voting: Already voted on this proposal");
        require(proposals[_proposalId].creatorCitizenId != voterCitizenId, "Voting: Cannot vote on own proposal");
        
        // Calculate voting power based on reputation
        uint256 votingPower = _calculateVotingPower(voterReputation);
        
        // Record vote
        proposalVotes[_proposalId].push(Vote({
            citizenId: voterCitizenId,
            voter: msg.sender,
            support: _support,
            votingPower: votingPower,
            timestamp: block.timestamp,
            reason: _reason
        }));
        
        hasVoted[_proposalId][voterCitizenId] = true;
        
        // Update proposal vote counts
        Proposal storage proposal = proposals[_proposalId];
        proposal.totalVotingPower += votingPower;
        
        if (_support) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }
        
        // Award reputation for voting participation
        bytes32 voteHash = keccak256(abi.encodePacked("vote", _proposalId));
        try reputationSystem.addVotingReputation(voterCitizenId, voteHash) {} catch {}
        
        emit VoteCast(_proposalId, voterCitizenId, msg.sender, _support, votingPower);
        
        // Check if proposal can be executed early
        _checkProposalExecution(_proposalId);
    }
    
    /**
     * @dev Execute proposal after voting period ends
     */
    function executeProposal(uint256 _proposalId) external validProposalId(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.ACTIVE, "Voting: Proposal not active");
        require(block.timestamp > proposal.votingEndTimestamp || _canExecuteEarly(_proposalId), 
                "Voting: Voting period not ended and cannot execute early");
        require(!proposal.isExecuted, "Voting: Proposal already executed");
        
        ProposalStatus newStatus = _determineProposalResult(_proposalId);
        proposal.status = newStatus;
        proposal.executionTimestamp = block.timestamp;
        proposal.isExecuted = true;
        
        emit ProposalExecuted(_proposalId, newStatus, proposal.yesVotes, proposal.noVotes);
        
        // If proposal passed, execute any on-chain actions
        if (newStatus == ProposalStatus.PASSED && proposal.executionData.length > 0) {
            _executeProposalActions(_proposalId);
        }
    }
    
    // View functions
    function getProposal(uint256 _proposalId) external view validProposalId(_proposalId) returns (Proposal memory) {
        return proposals[_proposalId];
    }
    
    function getProposalVotes(uint256 _proposalId) external view validProposalId(_proposalId) returns (Vote[] memory) {
        return proposalVotes[_proposalId];
    }
    
    function getProposalsByType(ProposalType _proposalType) external view returns (uint256[] memory) {
        return typeProposals[uint256(_proposalType)];
    }
    
    function getCitizenProposals(address _citizen) external view returns (uint256[] memory) {
        return citizenProposals[_citizen];
    }
    
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count active proposals
        for (uint256 i = 1; i <= _proposalIdCounter; i++) {
            if (proposals[i].status == ProposalStatus.ACTIVE && 
                block.timestamp <= proposals[i].votingEndTimestamp) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory activeProposals = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _proposalIdCounter; i++) {
            if (proposals[i].status == ProposalStatus.ACTIVE && 
                block.timestamp <= proposals[i].votingEndTimestamp) {
                activeProposals[index] = i;
                index++;
            }
        }
        
        return activeProposals;
    }
    
    function getTotalProposals() external view returns (uint256) {
        return _proposalIdCounter;
    }
    
    function getVotingStats() external view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 passedProposals,
        uint256 rejectedProposals
    ) {
        uint256 active = 0;
        uint256 passed = 0;
        uint256 rejected = 0;
        
        for (uint256 i = 1; i <= _proposalIdCounter; i++) {
            ProposalStatus status = proposals[i].status;
            
            if (status == ProposalStatus.ACTIVE && block.timestamp <= proposals[i].votingEndTimestamp) {
                active++;
            } else if (status == ProposalStatus.PASSED) {
                passed++;
            } else if (status == ProposalStatus.REJECTED) {
                rejected++;
            }
        }
        
        return (_proposalIdCounter, active, passed, rejected);
    }
    
    // Internal functions
    function _calculateVotingPower(uint256 _reputation) internal pure returns (uint256) {
        // Base voting power with reputation multiplier
        if (_reputation >= 1000) return 100;      // High reputation
        else if (_reputation >= 500) return 50;   // Medium reputation
        else if (_reputation >= 100) return 25;   // Basic reputation
        else return 10;                           // Minimum voting power
    }
    
    function _checkProposalExecution(uint256 _proposalId) internal {
        if (_canExecuteEarly(_proposalId)) {
            Proposal storage proposal = proposals[_proposalId];
            ProposalStatus newStatus = _determineProposalResult(_proposalId);
            proposal.status = newStatus;
            proposal.executionTimestamp = block.timestamp;
            proposal.isExecuted = true;
            
            emit ProposalExecuted(_proposalId, newStatus, proposal.yesVotes, proposal.noVotes);
        }
    }
    
    function _canExecuteEarly(uint256 _proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[_proposalId];
        
        // Early execution if quorum met and overwhelming majority
        if (proposal.totalVotingPower >= proposal.quorumRequired) {
            uint256 yesPercentage = (proposal.yesVotes * 10000) / proposal.totalVotingPower;
            return yesPercentage >= 8000; // 80% majority allows early execution
        }
        
        return false;
    }
    
    function _determineProposalResult(uint256 _proposalId) internal view returns (ProposalStatus) {
        Proposal storage proposal = proposals[_proposalId];
        
        // Check quorum
        if (proposal.totalVotingPower < proposal.quorumRequired) {
            return ProposalStatus.EXPIRED;
        }
        
        // Check passing threshold
        uint256 yesPercentage = (proposal.yesVotes * 10000) / proposal.totalVotingPower;
        return yesPercentage >= proposal.passingThreshold ? ProposalStatus.PASSED : ProposalStatus.REJECTED;
    }
    
    function _executeProposalActions(uint256 _proposalId) internal {
        // Implementation for executing proposal-specific actions
        // This could include updating project registry, treasury allocations, etc.
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.proposalType == ProposalType.PROJECT_APPROVAL && proposal.relatedProjectId > 0) {
            // Could trigger project status update in project registry
            // projectRegistry.updateProjectStatus(proposal.relatedProjectId, ProjectStatus.APPROVED);
        }
    }
    
    // Admin functions
    function updateVotingConfig(
        uint256 _defaultVotingPeriod,
        uint256 _minimumQuorum,
        uint256 _defaultPassingThreshold,
        uint256 _minimumReputationToPropose,
        uint256 _minimumReputationToVote
    ) external onlyOwner {
        require(_defaultPassingThreshold >= 5000 && _defaultPassingThreshold <= 10000, 
                "Voting: Invalid passing threshold");
        
        defaultVotingPeriod = _defaultVotingPeriod;
        minimumQuorum = _minimumQuorum;
        defaultPassingThreshold = _defaultPassingThreshold;
        minimumReputationToPropose = _minimumReputationToPropose;
        minimumReputationToVote = _minimumReputationToVote;
    }
    
    function cancelProposal(uint256 _proposalId) external validProposalId(_proposalId) {
        require(
            proposals[_proposalId].creator == msg.sender || msg.sender == owner(),
            "Voting: Not authorized to cancel"
        );
        require(proposals[_proposalId].status == ProposalStatus.ACTIVE, "Voting: Proposal not active");
        
        ProposalStatus oldStatus = proposals[_proposalId].status;
        proposals[_proposalId].status = ProposalStatus.CANCELLED;
        
        emit ProposalStatusChanged(_proposalId, oldStatus, ProposalStatus.CANCELLED);
    }
    
    function updateReputationSystem(address _reputationSystem) external onlyOwner {
        require(_reputationSystem != address(0), "Voting: Invalid reputation system");
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    function updateProjectRegistry(address _projectRegistry) external onlyOwner {
        require(_projectRegistry != address(0), "Voting: Invalid project registry");
        projectRegistry = GovernmentProjectRegistry(_projectRegistry);
    }
}