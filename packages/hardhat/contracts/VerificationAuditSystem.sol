// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CitizenIdentityRegistry.sol";
import "./ReputationSystem.sol";
import "./IssueReportingSystem.sol";
import "./GovernmentProjectRegistry.sol";

/**
 * @title VerificationAuditSystem
 * @dev Manages verification workflows and audit trails
 * @author CitiProof Team
 */
contract VerificationAuditSystem is Ownable, ReentrancyGuard {
    
    CitizenIdentityRegistry public immutable citizenRegistry;
    ReputationSystem public reputationSystem;
    IssueReportingSystem public issueReportingSystem;
    GovernmentProjectRegistry public projectRegistry;
    
    enum VerificationType {
        ISSUE_VERIFICATION,      // Verifying issue reports
        PROJECT_MILESTONE,       // Verifying project completion
        BUDGET_EXPENDITURE,      // Verifying financial transactions
        DOCUMENT_AUTHENTICITY,   // Verifying document legitimacy
        COMPLIANCE_CHECK        // Verifying regulatory compliance
    }
    
    enum VerificationStatus {
        PENDING,        // Awaiting verification
        IN_PROGRESS,    // Being verified
        VERIFIED,       // Successfully verified
        DISPUTED,       // Verification disputed
        REJECTED,       // Verification failed
        EXPIRED         // Verification period expired
    }
    
    struct VerificationRequest {
        uint256 requestId;
        uint256 submitterCitizenId;
        address submitter;
        VerificationType verificationType;
        VerificationStatus status;
        string title; // Keep on-chain for indexing
        string ipfsDescriptionHash; // IPFS hash for detailed description
        string evidenceHash; // IPFS hash for evidence
        uint256 relatedEntityId; // Related issue/project/transaction ID
        uint256 submissionTimestamp;
        uint256 deadline;
        uint256 requiredVerifications;
        uint256 completedVerifications;
        uint256 reputationReward;
        bool isPaid;
        string[] tags; // Keep on-chain for filtering
    }
    
    struct VerificationResponse {
        uint256 verifierCitizenId;
        address verifier;
        bool isApproved;
        string ipfsFindingsHash; // IPFS hash for detailed findings
        string evidenceHash; // Additional evidence from verifier
        uint256 timestamp;
        uint256 verifierReputationAtTime;
        bool isDisputed;
    }
    
    struct AuditTrail {
        uint256 auditId;
        uint256 relatedEntityId;
        VerificationType entityType;
        string action; // Keep action type on-chain for indexing
        address performedBy;
        uint256 timestamp;
        string ipfsDetailsHash; // IPFS hash for detailed audit information
        bytes32 dataHash; // Hash of the state before action
        bool isReversible;
    }
    
    // Storage
    uint256 private _verificationRequestIdCounter;
    uint256 private _auditTrailIdCounter;
    
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => VerificationResponse[]) public verificationResponses;
    mapping(uint256 => mapping(uint256 => bool)) public hasVerified; // requestId => citizenId => verified
    mapping(uint256 => AuditTrail) public auditTrail;
    mapping(uint256 => uint256[]) public entityAudits; // entityId => auditIds
    mapping(address => uint256[]) public citizenVerifications; // citizen => requestIds
    mapping(address => bool) public authorizedAuditors;
    
    // Configuration
    uint256 public defaultVerificationDeadline = 3 days;
    uint256 public minimumReputationToVerify = 100;
    uint256 public baseVerificationReward = 25;
    uint256 public disputePenalty = 50;
    
    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        uint256 indexed submitterCitizenId,
        VerificationType verificationType,
        uint256 relatedEntityId
    );
    
    event VerificationCompleted(
        uint256 indexed requestId,
        uint256 indexed verifierCitizenId,
        address indexed verifier,
        bool isApproved
    );
    
    event VerificationFinalized(
        uint256 indexed requestId,
        VerificationStatus finalStatus,
        uint256 totalVerifications
    );
    
    event VerificationDisputed(
        uint256 indexed requestId,
        uint256 indexed disputerCitizenId,
        address indexed disputer
    );
    
    event AuditRecorded(
        uint256 indexed auditId,
        uint256 indexed relatedEntityId,
        string action,
        address indexed performedBy
    );
    
    // Modifiers
    modifier onlyRegisteredCitizen() {
        require(citizenRegistry.isCitizenRegistered(msg.sender), "Verification: Must be registered citizen");
        _;
    }
    
    modifier onlyAuthorizedAuditor() {
        require(authorizedAuditors[msg.sender] || msg.sender == owner(), 
                "Verification: Not authorized auditor");
        _;
    }
    
    modifier validRequestId(uint256 _requestId) {
        require(_requestId > 0 && _requestId <= _verificationRequestIdCounter, 
                "Verification: Invalid request ID");
        _;
    }
    
    constructor(
        address initialOwner,
        address _citizenRegistry,
        address _reputationSystem
    ) Ownable(initialOwner) {
        require(_citizenRegistry != address(0), "Verification: Invalid citizen registry");
        require(_reputationSystem != address(0), "Verification: Invalid reputation system");
        
        citizenRegistry = CitizenIdentityRegistry(_citizenRegistry);
        reputationSystem = ReputationSystem(_reputationSystem);
    }
    
    /**
     * @dev Submit a verification request
     */
    function submitVerificationRequest(
        VerificationType _verificationType,
        string memory _title,
        string memory _description,
        string memory _evidenceHash,
        uint256 _relatedEntityId,
        uint256 _requiredVerifications,
        string[] memory _tags
    ) external onlyRegisteredCitizen nonReentrant {
        require(bytes(_title).length > 0, "Verification: Title cannot be empty");
        require(bytes(_description).length > 10, "Verification: Description too short");
        require(_requiredVerifications > 0 && _requiredVerifications <= 10, 
                "Verification: Invalid verification count");
        
        // Get submitter's citizen ID
        uint256 submitterCitizenId = 0;
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            submitterCitizenId = profile.citizenId;
        } catch {
            revert("Verification: Failed to get citizen profile");
        }
        
        _verificationRequestIdCounter++;
        uint256 newRequestId = _verificationRequestIdCounter;
        
        verificationRequests[newRequestId] = VerificationRequest({
            requestId: newRequestId,
            submitterCitizenId: submitterCitizenId,
            submitter: msg.sender,
            verificationType: _verificationType,
            status: VerificationStatus.PENDING,
            title: _title,
            ipfsDescriptionHash: _description,
            evidenceHash: _evidenceHash,
            relatedEntityId: _relatedEntityId,
            submissionTimestamp: block.timestamp,
            deadline: block.timestamp + defaultVerificationDeadline,
            requiredVerifications: _requiredVerifications,
            completedVerifications: 0,
            reputationReward: baseVerificationReward,
            isPaid: false,
            tags: _tags
        });
        
        citizenVerifications[msg.sender].push(newRequestId);
        
        // Record audit trail
        _recordAudit(
            _relatedEntityId,
            _verificationType,
            "Verification requested",
            msg.sender,
            "Verification request submitted for review"
        );
        
        emit VerificationRequested(newRequestId, submitterCitizenId, _verificationType, _relatedEntityId);
    }
    
    /**
     * @dev Complete verification for a request
     */
    function completeVerification(
        uint256 _requestId,
        bool _isApproved,
        string memory _findings,
        string memory _additionalEvidenceHash
    ) external onlyRegisteredCitizen validRequestId(_requestId) {
        VerificationRequest storage request = verificationRequests[_requestId];
        require(request.status == VerificationStatus.PENDING || request.status == VerificationStatus.IN_PROGRESS, 
                "Verification: Request not open for verification");
        require(block.timestamp <= request.deadline, "Verification: Verification deadline passed");
        
        // Get verifier's citizen ID and reputation
        uint256 verifierCitizenId = 0;
        uint256 verifierReputation = 0;
        
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            verifierCitizenId = profile.citizenId;
            verifierReputation = profile.reputationScore;
        } catch {
            revert("Verification: Failed to get citizen profile");
        }
        
        require(verifierReputation >= minimumReputationToVerify, 
                "Verification: Insufficient reputation to verify");
        require(!hasVerified[_requestId][verifierCitizenId], 
                "Verification: Already verified this request");
        require(request.submitterCitizenId != verifierCitizenId, 
                "Verification: Cannot verify own request");
        
        // Record verification response
        verificationResponses[_requestId].push(VerificationResponse({
            verifierCitizenId: verifierCitizenId,
            verifier: msg.sender,
            isApproved: _isApproved,
            ipfsFindingsHash: _findings,
            evidenceHash: _additionalEvidenceHash,
            timestamp: block.timestamp,
            verifierReputationAtTime: verifierReputation,
            isDisputed: false
        }));
        
        hasVerified[_requestId][verifierCitizenId] = true;
        request.completedVerifications++;
        
        // Update status to in progress if first verification
        if (request.status == VerificationStatus.PENDING) {
            request.status = VerificationStatus.IN_PROGRESS;
        }
        
        emit VerificationCompleted(_requestId, verifierCitizenId, msg.sender, _isApproved);
        
        // Award reputation for verification
        bytes32 verificationHash = keccak256(abi.encodePacked("verification", _requestId));
        try reputationSystem.addVerificationReputation(verifierCitizenId, verificationHash) {} catch {}
        
        // Check if verification is complete
        if (request.completedVerifications >= request.requiredVerifications) {
            _finalizeVerification(_requestId);
        }
    }
    
    /**
     * @dev Dispute a verification
     */
    function disputeVerification(
        uint256 _requestId,
        uint256 _responseIndex,
        string memory _disputeReason
    ) external onlyRegisteredCitizen validRequestId(_requestId) {
        require(_responseIndex < verificationResponses[_requestId].length, 
                "Verification: Invalid response index");
        require(bytes(_disputeReason).length > 10, "Verification: Dispute reason too short");
        
        VerificationResponse storage response = verificationResponses[_requestId][_responseIndex];
        require(!response.isDisputed, "Verification: Already disputed");
        require(response.verifier != msg.sender, "Verification: Cannot dispute own verification");
        
        // Get disputer's citizen ID and reputation
        uint256 disputerCitizenId = 0;
        uint256 disputerReputation = 0;
        
        try citizenRegistry.getCitizenByWallet(msg.sender) returns (CitizenIdentityRegistry.CitizenProfile memory profile) {
            disputerCitizenId = profile.citizenId;
            disputerReputation = profile.reputationScore;
        } catch {
            revert("Verification: Failed to get citizen profile");
        }
        
        require(disputerReputation >= minimumReputationToVerify, 
                "Verification: Insufficient reputation to dispute");
        
        response.isDisputed = true;
        verificationRequests[_requestId].status = VerificationStatus.DISPUTED;
        
        // Record audit trail
        _recordAudit(
            verificationRequests[_requestId].relatedEntityId,
            verificationRequests[_requestId].verificationType,
            "Verification disputed",
            msg.sender,
            _disputeReason
        );
        
        emit VerificationDisputed(_requestId, disputerCitizenId, msg.sender);
    }
    
    /**
     * @dev Record audit trail entry
     */
    function recordAudit(
        uint256 _relatedEntityId,
        VerificationType _entityType,
        string memory _action,
        string memory _details
    ) external onlyAuthorizedAuditor {
        _recordAudit(_relatedEntityId, _entityType, _action, msg.sender, _details);
    }
    
    // View functions
    function getVerificationRequest(uint256 _requestId) external view validRequestId(_requestId) returns (VerificationRequest memory) {
        return verificationRequests[_requestId];
    }
    
    function getVerificationResponses(uint256 _requestId) external view validRequestId(_requestId) returns (VerificationResponse[] memory) {
        return verificationResponses[_requestId];
    }
    
    function getCitizenVerifications(address _citizen) external view returns (uint256[] memory) {
        return citizenVerifications[_citizen];
    }
    
    function getEntityAuditTrail(uint256 _entityId) external view returns (uint256[] memory) {
        return entityAudits[_entityId];
    }
    
    function getPendingVerifications() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count pending verifications
        for (uint256 i = 1; i <= _verificationRequestIdCounter; i++) {
            if (verificationRequests[i].status == VerificationStatus.PENDING || 
                verificationRequests[i].status == VerificationStatus.IN_PROGRESS) {
                if (block.timestamp <= verificationRequests[i].deadline) {
                    count++;
                }
            }
        }
        
        // Create result array
        uint256[] memory pending = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _verificationRequestIdCounter; i++) {
            if (verificationRequests[i].status == VerificationStatus.PENDING || 
                verificationRequests[i].status == VerificationStatus.IN_PROGRESS) {
                if (block.timestamp <= verificationRequests[i].deadline) {
                    pending[index] = i;
                    index++;
                }
            }
        }
        
        return pending;
    }
    
    function getVerificationStats() external view returns (
        uint256 totalRequests,
        uint256 pendingRequests,
        uint256 verifiedRequests,
        uint256 disputedRequests
    ) {
        uint256 pending = 0;
        uint256 verified = 0;
        uint256 disputed = 0;
        
        for (uint256 i = 1; i <= _verificationRequestIdCounter; i++) {
            VerificationStatus status = verificationRequests[i].status;
            
            if (status == VerificationStatus.PENDING || status == VerificationStatus.IN_PROGRESS) {
                pending++;
            } else if (status == VerificationStatus.VERIFIED) {
                verified++;
            } else if (status == VerificationStatus.DISPUTED) {
                disputed++;
            }
        }
        
        return (_verificationRequestIdCounter, pending, verified, disputed);
    }
    
    // Internal functions
    function _finalizeVerification(uint256 _requestId) internal {
        VerificationRequest storage request = verificationRequests[_requestId];
        VerificationResponse[] storage responses = verificationResponses[_requestId];
        
        uint256 approvedCount = 0;
        uint256 totalWeight = 0;
        uint256 approvedWeight = 0;
        
        // Calculate weighted approval
        for (uint256 i = 0; i < responses.length; i++) {
            if (!responses[i].isDisputed) {
                uint256 weight = _calculateVerificationWeight(responses[i].verifierReputationAtTime);
                totalWeight += weight;
                
                if (responses[i].isApproved) {
                    approvedCount++;
                    approvedWeight += weight;
                }
            }
        }
        
        // Determine final status
        VerificationStatus finalStatus;
        if (totalWeight == 0) {
            finalStatus = VerificationStatus.REJECTED;
        } else {
            uint256 approvalPercentage = (approvedWeight * 100) / totalWeight;
            finalStatus = approvalPercentage >= 60 ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;
        }
        
        request.status = finalStatus;
        
        // Record audit trail
        _recordAudit(
            request.relatedEntityId,
            request.verificationType,
            finalStatus == VerificationStatus.VERIFIED ? "Verification approved" : "Verification rejected",
            address(this),
            string(abi.encodePacked("Final verification result with ", approvedCount, " approvals"))
        );
        
        emit VerificationFinalized(_requestId, finalStatus, request.completedVerifications);
    }
    
    function _calculateVerificationWeight(uint256 _reputation) internal pure returns (uint256) {
        // Weight verification based on verifier reputation
        if (_reputation >= 1000) return 5;       // High reputation verifiers have more weight
        else if (_reputation >= 500) return 3;   // Medium reputation
        else if (_reputation >= 200) return 2;   // Good reputation
        else return 1;                           // Basic reputation
    }
    
    function _recordAudit(
        uint256 _relatedEntityId,
        VerificationType _entityType,
        string memory _action,
        address _performedBy,
        string memory _details
    ) internal {
        _auditTrailIdCounter++;
        uint256 newAuditId = _auditTrailIdCounter;
        
        bytes32 dataHash = keccak256(abi.encodePacked(
            _relatedEntityId,
            _action,
            _performedBy,
            block.timestamp,
            _details
        ));
        
        auditTrail[newAuditId] = AuditTrail({
            auditId: newAuditId,
            relatedEntityId: _relatedEntityId,
            entityType: _entityType,
            action: _action,
            performedBy: _performedBy,
            timestamp: block.timestamp,
            ipfsDetailsHash: _details,
            dataHash: dataHash,
            isReversible: false
        });
        
        entityAudits[_relatedEntityId].push(newAuditId);
        
        emit AuditRecorded(newAuditId, _relatedEntityId, _action, _performedBy);
    }
    
    // Admin functions
    function updateConfiguration(
        uint256 _defaultVerificationDeadline,
        uint256 _minimumReputationToVerify,
        uint256 _baseVerificationReward
    ) external onlyOwner {
        require(_defaultVerificationDeadline >= 1 days, "Verification: Deadline too short");
        require(_minimumReputationToVerify > 0, "Verification: Invalid reputation requirement");
        
        defaultVerificationDeadline = _defaultVerificationDeadline;
        minimumReputationToVerify = _minimumReputationToVerify;
        baseVerificationReward = _baseVerificationReward;
    }
    
    function authorizeAuditor(address _auditor, bool _authorized) external onlyOwner {
        require(_auditor != address(0), "Verification: Invalid auditor address");
        authorizedAuditors[_auditor] = _authorized;
    }
    
    function setExternalContracts(
        address _issueReportingSystem,
        address _projectRegistry
    ) external onlyOwner {
        if (_issueReportingSystem != address(0)) {
            issueReportingSystem = IssueReportingSystem(_issueReportingSystem);
        }
        if (_projectRegistry != address(0)) {
            projectRegistry = GovernmentProjectRegistry(_projectRegistry);
        }
    }
    
    function forceResolveDispute(
        uint256 _requestId,
        VerificationStatus _finalStatus
    ) external onlyOwner validRequestId(_requestId) {
        require(verificationRequests[_requestId].status == VerificationStatus.DISPUTED, 
                "Verification: Request not disputed");
        require(_finalStatus == VerificationStatus.VERIFIED || _finalStatus == VerificationStatus.REJECTED, 
                "Verification: Invalid final status");
        
        verificationRequests[_requestId].status = _finalStatus;
        
        _recordAudit(
            verificationRequests[_requestId].relatedEntityId,
            verificationRequests[_requestId].verificationType,
            "Dispute resolved by admin",
            msg.sender,
            string(abi.encodePacked("Admin resolution: ", _finalStatus == VerificationStatus.VERIFIED ? "Approved" : "Rejected"))
        );
        
        emit VerificationFinalized(_requestId, _finalStatus, verificationRequests[_requestId].completedVerifications);
    }
}