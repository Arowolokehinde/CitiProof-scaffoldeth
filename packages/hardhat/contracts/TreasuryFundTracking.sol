// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GovernmentProjectRegistry.sol";
import "./CitizenIdentityRegistry.sol";

/**
 * @title TreasuryFundTracking
 * @dev Handles all financial transparency and fund allocation tracking
 * @author CitiProof Team
 */
contract TreasuryFundTracking is Ownable, ReentrancyGuard {
    
    GovernmentProjectRegistry public immutable projectRegistry;
    CitizenIdentityRegistry public immutable citizenRegistry;
    
    // Fund source enumeration
    enum FundSource {
        GOVERNMENT_BUDGET,
        DONOR_CONTRIBUTION,
        GRANTS,
        FUNDRAISING,
        OTHER
    }
    
    // Transaction type enumeration
    enum TransactionType {
        ALLOCATION,    // Funds allocated to project
        EXPENDITURE,   // Actual spending
        REFUND,        // Funds returned
        TRANSFER,      // Inter-project transfer
        DONATION_IN,   // Donation received
        WITHDRAWAL     // Emergency withdrawal
    }
    
    // Fund allocation structure
    struct FundAllocation {
        uint256 allocationId;
        uint256 projectId;
        uint256 amount;
        FundSource source;
        address authorizedBy;
        uint256 timestamp;
        string ipfsDescriptionHash; // IPFS hash for detailed description
        bool isActive;
        string documentHash; // IPFS hash for supporting documents
    }
    
    // Financial transaction structure
    struct FinancialTransaction {
        uint256 transactionId;
        uint256 projectId;
        uint256 amount;
        TransactionType transactionType;
        FundSource source;
        address authorizedBy;
        address recipient; // Can be contractor, vendor, etc.
        uint256 timestamp;
        string ipfsDescriptionHash; // IPFS hash for detailed description
        string receiptHash; // IPFS hash for receipt/proof
        bool isVerified;
        address verifiedBy;
        uint256 verificationTimestamp;
    }
    
    // Donor contribution structure
    struct DonorContribution {
        uint256 contributionId;
        address donor;
        uint256 amount;
        uint256 projectId; // 0 for general fund
        uint256 timestamp;
        string ipfsMessageHash; // IPFS hash for donation message
        bool isAnonymous;
        bool isRefunded;
    }
    
    // Budget allocation structure
    struct BudgetAllocation {
        uint256 totalBudget;
        uint256 allocatedBudget;
        uint256 spentBudget;
        uint256 availableBudget;
        mapping(uint256 => uint256) projectAllocations; // projectId => allocated amount
        mapping(uint256 => uint256) projectSpending;    // projectId => spent amount
    }
    
    // Storage
    uint256 private _allocationIdCounter;
    uint256 private _transactionIdCounter;
    uint256 private _contributionIdCounter;
    
    BudgetAllocation private budget;
    mapping(uint256 => FundAllocation) public allocations;
    mapping(uint256 => FinancialTransaction) public transactions;
    mapping(uint256 => DonorContribution) public contributions;
    mapping(uint256 => uint256[]) public projectAllocations; // projectId => allocationIds
    mapping(uint256 => uint256[]) public projectTransactions; // projectId => transactionIds
    mapping(address => uint256[]) public donorContributions; // donor => contributionIds
    mapping(address => bool) public authorizedTreasurers;
    
    // Events
    event FundsAllocated(
        uint256 indexed allocationId,
        uint256 indexed projectId,
        uint256 amount,
        FundSource source,
        address indexed authorizedBy
    );
    
    event TransactionRecorded(
        uint256 indexed transactionId,
        uint256 indexed projectId,
        uint256 amount,
        TransactionType transactionType,
        address indexed recipient
    );
    
    event DonationReceived(
        uint256 indexed contributionId,
        address indexed donor,
        uint256 amount,
        uint256 indexed projectId
    );
    
    event TransactionVerified(
        uint256 indexed transactionId,
        address indexed verifiedBy,
        uint256 verificationTimestamp
    );
    
    event BudgetUpdated(
        uint256 previousTotal,
        uint256 newTotal,
        address indexed updatedBy
    );
    
    event TreasurerAuthorized(
        address indexed treasurer,
        bool authorized,
        address indexed authorizedBy
    );
    
    event EmergencyWithdrawal(
        uint256 amount,
        address indexed recipient,
        string reason,
        address indexed authorizedBy
    );
    
    // Modifiers
    modifier onlyAuthorizedTreasurer() {
        require(authorizedTreasurers[msg.sender] || msg.sender == owner(), 
                "Treasury: Not authorized treasurer");
        _;
    }
    
    modifier validProjectId(uint256 _projectId) {
        require(_projectId > 0 && _projectId <= projectRegistry.getTotalProjects(), 
                "Treasury: Invalid project ID");
        _;
    }
    
    modifier validAllocationId(uint256 _allocationId) {
        require(_allocationId > 0 && _allocationId <= _allocationIdCounter, 
                "Treasury: Invalid allocation ID");
        _;
    }
    
    modifier validTransactionId(uint256 _transactionId) {
        require(_transactionId > 0 && _transactionId <= _transactionIdCounter, 
                "Treasury: Invalid transaction ID");
        _;
    }
    
    constructor(
        address initialOwner,
        address _projectRegistry,
        address _citizenRegistry,
        uint256 _initialBudget
    ) Ownable(initialOwner) {
        require(_projectRegistry != address(0), "Treasury: Invalid project registry");
        require(_citizenRegistry != address(0), "Treasury: Invalid citizen registry");
        
        projectRegistry = GovernmentProjectRegistry(_projectRegistry);
        citizenRegistry = CitizenIdentityRegistry(_citizenRegistry);
        
        budget.totalBudget = _initialBudget;
        budget.availableBudget = _initialBudget;
    }
    
    /**
     * @dev Allocate funds to a specific project
     */
    function allocateFundsToProject(
        uint256 _projectId,
        uint256 _amount,
        FundSource _source,
        string memory _ipfsDescriptionHash,
        string memory _documentHash
    ) external onlyAuthorizedTreasurer validProjectId(_projectId) nonReentrant {
        require(_amount > 0, "Treasury: Amount must be greater than 0");
        require(budget.availableBudget >= _amount, "Treasury: Insufficient available budget");
        require(bytes(_ipfsDescriptionHash).length > 0, "Treasury: IPFS description hash required");
        
        _allocationIdCounter++;
        uint256 newAllocationId = _allocationIdCounter;
        
        // Create allocation record
        allocations[newAllocationId] = FundAllocation({
            allocationId: newAllocationId,
            projectId: _projectId,
            amount: _amount,
            source: _source,
            authorizedBy: msg.sender,
            timestamp: block.timestamp,
            ipfsDescriptionHash: _ipfsDescriptionHash,
            isActive: true,
            documentHash: _documentHash
        });
        
        // Update budget tracking
        budget.allocatedBudget += _amount;
        budget.availableBudget -= _amount;
        budget.projectAllocations[_projectId] += _amount;
        
        // Add to project allocations
        projectAllocations[_projectId].push(newAllocationId);
        
        emit FundsAllocated(newAllocationId, _projectId, _amount, _source, msg.sender);
    }
    
    /**
     * @dev Record a financial transaction (expenditure)
     */
    function recordTransaction(
        uint256 _projectId,
        uint256 _amount,
        TransactionType _transactionType,
        FundSource _source,
        address _recipient,
        string memory _ipfsDescriptionHash,
        string memory _receiptHash
    ) external onlyAuthorizedTreasurer validProjectId(_projectId) nonReentrant {
        require(_amount > 0, "Treasury: Amount must be greater than 0");
        require(_recipient != address(0), "Treasury: Invalid recipient address");
        require(bytes(_ipfsDescriptionHash).length > 0, "Treasury: IPFS description hash required");
        
        // Validate sufficient allocation for expenditures
        if (_transactionType == TransactionType.EXPENDITURE) {
            uint256 availableForProject = budget.projectAllocations[_projectId] - budget.projectSpending[_projectId];
            require(availableForProject >= _amount, "Treasury: Insufficient project allocation");
            
            // Update spending tracking
            budget.spentBudget += _amount;
            budget.projectSpending[_projectId] += _amount;
        }
        
        _transactionIdCounter++;
        uint256 newTransactionId = _transactionIdCounter;
        
        // Create transaction record
        transactions[newTransactionId] = FinancialTransaction({
            transactionId: newTransactionId,
            projectId: _projectId,
            amount: _amount,
            transactionType: _transactionType,
            source: _source,
            authorizedBy: msg.sender,
            recipient: _recipient,
            timestamp: block.timestamp,
            ipfsDescriptionHash: _ipfsDescriptionHash,
            receiptHash: _receiptHash,
            isVerified: false,
            verifiedBy: address(0),
            verificationTimestamp: 0
        });
        
        // Add to project transactions
        projectTransactions[_projectId].push(newTransactionId);
        
        emit TransactionRecorded(newTransactionId, _projectId, _amount, _transactionType, _recipient);
    }
    
    /**
     * @dev Receive donor contribution
     */
    function receiveDonation(
        uint256 _projectId,
        string memory _ipfsMessageHash,
        bool _isAnonymous
    ) external payable nonReentrant {
        require(msg.value > 0, "Treasury: Donation amount must be greater than 0");
        
        // If project ID is provided, validate it
        if (_projectId > 0) {
            require(_projectId <= projectRegistry.getTotalProjects(), "Treasury: Invalid project ID");
        }
        
        _contributionIdCounter++;
        uint256 newContributionId = _contributionIdCounter;
        
        // Create contribution record
        contributions[newContributionId] = DonorContribution({
            contributionId: newContributionId,
            donor: msg.sender,
            amount: msg.value,
            projectId: _projectId,
            timestamp: block.timestamp,
            ipfsMessageHash: _ipfsMessageHash,
            isAnonymous: _isAnonymous,
            isRefunded: false
        });
        
        // Update budget
        budget.totalBudget += msg.value;
        budget.availableBudget += msg.value;
        
        // Add to donor contributions
        donorContributions[msg.sender].push(newContributionId);
        
        emit DonationReceived(newContributionId, msg.sender, msg.value, _projectId);
    }
    
    /**
     * @dev Verify a transaction (by authorized verifiers)
     */
    function verifyTransaction(uint256 _transactionId) external validTransactionId(_transactionId) {
        // Check if caller is authorized (government entity, treasurer, or admin)
        require(
            authorizedTreasurers[msg.sender] || 
            msg.sender == owner() ||
            _isAuthorizedVerifier(msg.sender),
            "Treasury: Not authorized to verify transactions"
        );
        
        FinancialTransaction storage transaction = transactions[_transactionId];
        require(!transaction.isVerified, "Treasury: Transaction already verified");
        require(transaction.authorizedBy != msg.sender, "Treasury: Cannot verify own transaction");
        
        transaction.isVerified = true;
        transaction.verifiedBy = msg.sender;
        transaction.verificationTimestamp = block.timestamp;
        
        emit TransactionVerified(_transactionId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer funds between projects
     */
    function transferFundsBetweenProjects(
        uint256 _fromProjectId,
        uint256 _toProjectId,
        uint256 _amount,
        string memory _reason
    ) external onlyAuthorizedTreasurer nonReentrant {
        require(_fromProjectId != _toProjectId, "Treasury: Cannot transfer to same project");
        require(_amount > 0, "Treasury: Amount must be greater than 0");
        require(bytes(_reason).length > 0, "Treasury: Reason required");
        
        // Validate projects exist
        require(_fromProjectId <= projectRegistry.getTotalProjects(), "Treasury: Invalid from project");
        require(_toProjectId <= projectRegistry.getTotalProjects(), "Treasury: Invalid to project");
        
        // Check available funds in source project
        uint256 availableInSource = budget.projectAllocations[_fromProjectId] - budget.projectSpending[_fromProjectId];
        require(availableInSource >= _amount, "Treasury: Insufficient funds in source project");
        
        // Update allocations
        budget.projectAllocations[_fromProjectId] -= _amount;
        budget.projectAllocations[_toProjectId] += _amount;
        
        // Record transfer transactions
        _transactionIdCounter++;
        uint256 transferOutId = _transactionIdCounter;
        
        transactions[transferOutId] = FinancialTransaction({
            transactionId: transferOutId,
            projectId: _fromProjectId,
            amount: _amount,
            transactionType: TransactionType.TRANSFER,
            source: FundSource.GOVERNMENT_BUDGET,
            authorizedBy: msg.sender,
            recipient: address(this),
            timestamp: block.timestamp,
            ipfsDescriptionHash: "", // Simple transfer descriptions don't need IPFS
            receiptHash: "",
            isVerified: true, // Auto-verified for internal transfers
            verifiedBy: msg.sender,
            verificationTimestamp: block.timestamp
        });
        
        projectTransactions[_fromProjectId].push(transferOutId);
        
        _transactionIdCounter++;
        uint256 transferInId = _transactionIdCounter;
        
        transactions[transferInId] = FinancialTransaction({
            transactionId: transferInId,
            projectId: _toProjectId,
            amount: _amount,
            transactionType: TransactionType.ALLOCATION,
            source: FundSource.GOVERNMENT_BUDGET,
            authorizedBy: msg.sender,
            recipient: address(this),
            timestamp: block.timestamp,
            ipfsDescriptionHash: "", // Simple transfer descriptions don't need IPFS
            receiptHash: "",
            isVerified: true, // Auto-verified for internal transfers
            verifiedBy: msg.sender,
            verificationTimestamp: block.timestamp
        });
        
        projectTransactions[_toProjectId].push(transferInId);
        
        emit TransactionRecorded(transferOutId, _fromProjectId, _amount, TransactionType.TRANSFER, address(this));
        emit TransactionRecorded(transferInId, _toProjectId, _amount, TransactionType.ALLOCATION, address(this));
    }
    
    // View functions
    function getBudgetOverview() external view returns (
        uint256 totalBudget,
        uint256 allocatedBudget,
        uint256 spentBudget,
        uint256 availableBudget,
        uint256 utilizationPercentage
    ) {
        uint256 utilization = budget.totalBudget > 0 ? (budget.spentBudget * 10000) / budget.totalBudget : 0;
        
        return (
            budget.totalBudget,
            budget.allocatedBudget,
            budget.spentBudget,
            budget.availableBudget,
            utilization
        );
    }
    
    function getProjectFinancials(uint256 _projectId) external view validProjectId(_projectId) returns (
        uint256 allocatedAmount,
        uint256 spentAmount,
        uint256 availableAmount,
        uint256 transactionCount,
        uint256 utilizationPercentage
    ) {
        uint256 allocated = budget.projectAllocations[_projectId];
        uint256 spent = budget.projectSpending[_projectId];
        uint256 available = allocated > spent ? allocated - spent : 0;
        uint256 utilization = allocated > 0 ? (spent * 10000) / allocated : 0;
        
        return (
            allocated,
            spent,
            available,
            projectTransactions[_projectId].length,
            utilization
        );
    }
    
    function getProjectTransactions(uint256 _projectId) external view validProjectId(_projectId) returns (uint256[] memory) {
        return projectTransactions[_projectId];
    }
    
    function getProjectAllocations(uint256 _projectId) external view validProjectId(_projectId) returns (uint256[] memory) {
        return projectAllocations[_projectId];
    }
    
    function getDonorContributions(address _donor) external view returns (uint256[] memory) {
        return donorContributions[_donor];
    }
    
    function getTotalContributions() external view returns (uint256 totalAmount, uint256 totalCount) {
        uint256 total = 0;
        for (uint256 i = 1; i <= _contributionIdCounter; i++) {
            if (!contributions[i].isRefunded) {
                total += contributions[i].amount;
            }
        }
        return (total, _contributionIdCounter);
    }
    
    function getUnverifiedTransactions() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count unverified transactions
        for (uint256 i = 1; i <= _transactionIdCounter; i++) {
            if (!transactions[i].isVerified) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory unverifiedIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _transactionIdCounter; i++) {
            if (!transactions[i].isVerified) {
                unverifiedIds[index] = i;
                index++;
            }
        }
        
        return unverifiedIds;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Internal functions
    function _isAuthorizedVerifier(address _verifier) internal view returns (bool) {
        // Check if verifier is a registered citizen with sufficient reputation
        try citizenRegistry.isCitizenRegistered(_verifier) returns (bool isRegistered) {
            if (!isRegistered) return false;
            
            // Add reputation threshold check when reputation system is integrated
            // For now, any registered citizen can verify
            return true;
        } catch {
            return false;
        }
    }
    
    // Admin functions
    function updateBudget(uint256 _newTotalBudget) external onlyOwner {
        require(_newTotalBudget >= budget.spentBudget, "Treasury: New budget less than already spent");
        
        uint256 previousBudget = budget.totalBudget;
        
        if (_newTotalBudget > budget.totalBudget) {
            // Budget increase
            budget.availableBudget += (_newTotalBudget - budget.totalBudget);
        } else if (_newTotalBudget < budget.totalBudget) {
            // Budget decrease
            uint256 decrease = budget.totalBudget - _newTotalBudget;
            budget.availableBudget = budget.availableBudget > decrease ? budget.availableBudget - decrease : 0;
        }
        
        budget.totalBudget = _newTotalBudget;
        
        emit BudgetUpdated(previousBudget, _newTotalBudget, msg.sender);
    }
    
    function authorizeTreasurer(address _treasurer, bool _authorized) external onlyOwner {
        require(_treasurer != address(0), "Treasury: Invalid treasurer address");
        authorizedTreasurers[_treasurer] = _authorized;
        emit TreasurerAuthorized(_treasurer, _authorized, msg.sender);
    }
    
    function emergencyWithdraw(uint256 _amount, address payable _recipient, string memory _reason) external onlyOwner {
        require(_amount > 0, "Treasury: Amount must be greater than 0");
        require(_recipient != address(0), "Treasury: Invalid recipient");
        require(address(this).balance >= _amount, "Treasury: Insufficient contract balance");
        require(bytes(_reason).length > 0, "Treasury: Reason required");
        
        _recipient.transfer(_amount);
        
        emit EmergencyWithdrawal(_amount, _recipient, _reason, msg.sender);
    }
    
    function refundDonation(uint256 _contributionId) external onlyOwner {
        require(_contributionId > 0 && _contributionId <= _contributionIdCounter, "Treasury: Invalid contribution ID");
        
        DonorContribution storage contribution = contributions[_contributionId];
        require(!contribution.isRefunded, "Treasury: Already refunded");
        require(address(this).balance >= contribution.amount, "Treasury: Insufficient balance for refund");
        
        contribution.isRefunded = true;
        budget.totalBudget -= contribution.amount;
        budget.availableBudget = budget.availableBudget > contribution.amount ? 
                                budget.availableBudget - contribution.amount : 0;
        
        payable(contribution.donor).transfer(contribution.amount);
    }
    
    // Allow contract to receive donations
    receive() external payable {
        // Donations received without explicit project assignment go to general fund
        _contributionIdCounter++;
        uint256 newContributionId = _contributionIdCounter;
        
        contributions[newContributionId] = DonorContribution({
            contributionId: newContributionId,
            donor: msg.sender,
            amount: msg.value,
            projectId: 0, // General fund
            timestamp: block.timestamp,
            ipfsMessageHash: "", // Simple direct donation message
            isAnonymous: false,
            isRefunded: false
        });
        
        budget.totalBudget += msg.value;
        budget.availableBudget += msg.value;
        
        donorContributions[msg.sender].push(newContributionId);
        
        emit DonationReceived(newContributionId, msg.sender, msg.value, 0);
    }
}