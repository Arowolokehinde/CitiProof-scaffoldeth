// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CitizenIdentityRegistry.sol";

/**
 * @title GovernmentProjectRegistry
 * @dev Manages all government projects and their lifecycle
 * @author CitiProof Team
 */
contract GovernmentProjectRegistry is Ownable, ReentrancyGuard {
    
    CitizenIdentityRegistry public immutable citizenRegistry;
    
    // Project status enumeration
    enum ProjectStatus {
        PROPOSED,      // Project proposed but not approved
        APPROVED,      // Project approved and funded
        IN_PROGRESS,   // Project execution started
        COMPLETED,     // Project completed successfully
        CANCELLED,     // Project cancelled
        UNDER_REVIEW   // Project under audit/review
    }
    
    // Project category enumeration
    enum ProjectCategory {
        INFRASTRUCTURE,
        HEALTHCARE,
        EDUCATION,
        ENVIRONMENT,
        SOCIAL_SERVICES,
        TECHNOLOGY,
        SECURITY,
        ECONOMIC_DEVELOPMENT,
        OTHER
    }
    
    // Project milestone structure
    struct ProjectMilestone {
        uint256 milestoneId;
        string title;
        string description;
        uint256 targetDate;
        uint256 completionDate;
        uint256 budgetAllocated;
        uint256 budgetSpent;
        bool isCompleted;
        string evidenceHash; // IPFS hash of completion evidence
    }
    
    // Main project structure
    struct Project {
        uint256 projectId;
        string title;
        string description;
        ProjectCategory category;
        ProjectStatus status;
        address governmentEntity; // Government wallet that created the project
        uint256 totalBudget;
        uint256 budgetSpent;
        uint256 startDate;
        uint256 estimatedEndDate;
        uint256 actualEndDate;
        string documentationHash; // IPFS hash for project documents
        uint256 citizenSupportScore; // Based on citizen votes/feedback
        bool isPublic; // Whether project details are public
        uint256 creationTimestamp;
        uint256 lastUpdateTimestamp;
    }
    
    // Storage
    uint256 private _projectIdCounter;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => ProjectMilestone[]) public projectMilestones;
    mapping(uint256 => mapping(uint256 => bool)) public milestoneCompleted; // projectId => milestoneId => completed
    mapping(address => bool) public authorizedGovernmentEntities;
    mapping(uint256 => uint256[]) public categoryProjects; // category => projectIds
    mapping(address => uint256[]) public governmentEntityProjects; // entity => projectIds
    
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string title,
        ProjectCategory category,
        address indexed governmentEntity,
        uint256 totalBudget
    );
    
    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus,
        address indexed updatedBy
    );
    
    event ProjectMilestoneAdded(
        uint256 indexed projectId,
        uint256 milestoneId,
        string title,
        uint256 targetDate,
        uint256 budgetAllocated
    );
    
    event ProjectMilestoneCompleted(
        uint256 indexed projectId,
        uint256 milestoneId,
        uint256 completionDate,
        uint256 actualBudgetSpent,
        string evidenceHash
    );
    
    event ProjectBudgetUpdated(
        uint256 indexed projectId,
        uint256 previousBudget,
        uint256 newBudget,
        address indexed updatedBy
    );
    
    event GovernmentEntityAuthorized(
        address indexed entity,
        bool authorized,
        address indexed authorizedBy
    );
    
    // Modifiers
    modifier onlyAuthorizedGovernment() {
        require(authorizedGovernmentEntities[msg.sender], "ProjectRegistry: Not authorized government entity");
        _;
    }
    
    modifier validProjectId(uint256 _projectId) {
        require(_projectId > 0 && _projectId <= _projectIdCounter, "ProjectRegistry: Invalid project ID");
        _;
    }
    
    modifier onlyProjectOwner(uint256 _projectId) {
        require(projects[_projectId].governmentEntity == msg.sender, "ProjectRegistry: Not project owner");
        _;
    }
    
    constructor(
        address initialOwner,
        address _citizenRegistry
    ) Ownable(initialOwner) {
        require(_citizenRegistry != address(0), "ProjectRegistry: Invalid citizen registry");
        citizenRegistry = CitizenIdentityRegistry(_citizenRegistry);
    }
    
    /**
     * @dev Create a new government project
     */
    function createProject(
        string memory _title,
        string memory _description,
        ProjectCategory _category,
        uint256 _totalBudget,
        uint256 _estimatedEndDate,
        string memory _documentationHash,
        bool _isPublic
    ) external onlyAuthorizedGovernment nonReentrant {
        require(bytes(_title).length > 0, "ProjectRegistry: Title cannot be empty");
        require(_totalBudget > 0, "ProjectRegistry: Budget must be greater than 0");
        require(_estimatedEndDate > block.timestamp, "ProjectRegistry: End date must be in future");
        
        _projectIdCounter++;
        uint256 newProjectId = _projectIdCounter;
        
        projects[newProjectId] = Project({
            projectId: newProjectId,
            title: _title,
            description: _description,
            category: _category,
            status: ProjectStatus.PROPOSED,
            governmentEntity: msg.sender,
            totalBudget: _totalBudget,
            budgetSpent: 0,
            startDate: 0, // Will be set when approved
            estimatedEndDate: _estimatedEndDate,
            actualEndDate: 0,
            documentationHash: _documentationHash,
            citizenSupportScore: 0,
            isPublic: _isPublic,
            creationTimestamp: block.timestamp,
            lastUpdateTimestamp: block.timestamp
        });
        
        // Add to category and entity mappings
        categoryProjects[uint256(_category)].push(newProjectId);
        governmentEntityProjects[msg.sender].push(newProjectId);
        
        emit ProjectCreated(newProjectId, _title, _category, msg.sender, _totalBudget);
    }
    
    /**
     * @dev Update project status
     */
    function updateProjectStatus(
        uint256 _projectId,
        ProjectStatus _newStatus
    ) external validProjectId(_projectId) onlyProjectOwner(_projectId) {
        Project storage project = projects[_projectId];
        ProjectStatus oldStatus = project.status;
        
        require(oldStatus != _newStatus, "ProjectRegistry: Status unchanged");
        require(_isValidStatusTransition(oldStatus, _newStatus), "ProjectRegistry: Invalid status transition");
        
        project.status = _newStatus;
        project.lastUpdateTimestamp = block.timestamp;
        
        // Set start date when approved
        if (_newStatus == ProjectStatus.APPROVED && project.startDate == 0) {
            project.startDate = block.timestamp;
        }
        
        // Set completion date when completed
        if (_newStatus == ProjectStatus.COMPLETED && project.actualEndDate == 0) {
            project.actualEndDate = block.timestamp;
        }
        
        emit ProjectStatusUpdated(_projectId, oldStatus, _newStatus, msg.sender);
    }
    
    /**
     * @dev Add milestone to project
     */
    function addProjectMilestone(
        uint256 _projectId,
        string memory _title,
        string memory _description,
        uint256 _targetDate,
        uint256 _budgetAllocated
    ) external validProjectId(_projectId) onlyProjectOwner(_projectId) {
        require(bytes(_title).length > 0, "ProjectRegistry: Milestone title cannot be empty");
        require(_targetDate > block.timestamp, "ProjectRegistry: Target date must be in future");
        require(_budgetAllocated > 0, "ProjectRegistry: Budget must be greater than 0");
        
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.APPROVED || project.status == ProjectStatus.IN_PROGRESS, 
                "ProjectRegistry: Project must be approved or in progress");
        
        uint256 milestoneId = projectMilestones[_projectId].length + 1;
        
        ProjectMilestone memory newMilestone = ProjectMilestone({
            milestoneId: milestoneId,
            title: _title,
            description: _description,
            targetDate: _targetDate,
            completionDate: 0,
            budgetAllocated: _budgetAllocated,
            budgetSpent: 0,
            isCompleted: false,
            evidenceHash: ""
        });
        
        projectMilestones[_projectId].push(newMilestone);
        
        emit ProjectMilestoneAdded(_projectId, milestoneId, _title, _targetDate, _budgetAllocated);
    }
    
    /**
     * @dev Complete project milestone
     */
    function completeProjectMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        uint256 _actualBudgetSpent,
        string memory _evidenceHash
    ) external validProjectId(_projectId) onlyProjectOwner(_projectId) {
        require(_milestoneId > 0 && _milestoneId <= projectMilestones[_projectId].length, 
                "ProjectRegistry: Invalid milestone ID");
        require(!milestoneCompleted[_projectId][_milestoneId], "ProjectRegistry: Milestone already completed");
        require(bytes(_evidenceHash).length > 0, "ProjectRegistry: Evidence hash required");
        
        ProjectMilestone storage milestone = projectMilestones[_projectId][_milestoneId - 1];
        Project storage project = projects[_projectId];
        
        require(_actualBudgetSpent <= milestone.budgetAllocated, "ProjectRegistry: Spent exceeds allocated budget");
        require(project.budgetSpent + _actualBudgetSpent <= project.totalBudget, 
                "ProjectRegistry: Total spent would exceed project budget");
        
        // Update milestone
        milestone.isCompleted = true;
        milestone.completionDate = block.timestamp;
        milestone.budgetSpent = _actualBudgetSpent;
        milestone.evidenceHash = _evidenceHash;
        milestoneCompleted[_projectId][_milestoneId] = true;
        
        // Update project budget
        project.budgetSpent += _actualBudgetSpent;
        project.lastUpdateTimestamp = block.timestamp;
        
        // Update project status to in progress if not already
        if (project.status == ProjectStatus.APPROVED) {
            project.status = ProjectStatus.IN_PROGRESS;
            emit ProjectStatusUpdated(_projectId, ProjectStatus.APPROVED, ProjectStatus.IN_PROGRESS, msg.sender);
        }
        
        emit ProjectMilestoneCompleted(_projectId, _milestoneId, block.timestamp, _actualBudgetSpent, _evidenceHash);
    }
    
    /**
     * @dev Update project budget (owner or admin only)
     */
    function updateProjectBudget(
        uint256 _projectId,
        uint256 _newBudget
    ) external validProjectId(_projectId) {
        require(
            msg.sender == projects[_projectId].governmentEntity || msg.sender == owner(),
            "ProjectRegistry: Not authorized to update budget"
        );
        require(_newBudget > 0, "ProjectRegistry: Budget must be greater than 0");
        
        Project storage project = projects[_projectId];
        require(_newBudget >= project.budgetSpent, "ProjectRegistry: New budget less than already spent");
        
        uint256 previousBudget = project.totalBudget;
        project.totalBudget = _newBudget;
        project.lastUpdateTimestamp = block.timestamp;
        
        emit ProjectBudgetUpdated(_projectId, previousBudget, _newBudget, msg.sender);
    }
    
    /**
     * @dev Update citizen support score (called by voting contract)
     */
    function updateCitizenSupportScore(
        uint256 _projectId,
        uint256 _supportScore
    ) external validProjectId(_projectId) {
        // TODO: Add access control for voting contract
        // require(msg.sender == votingContract, "ProjectRegistry: Only voting contract can update support");
        
        projects[_projectId].citizenSupportScore = _supportScore;
        projects[_projectId].lastUpdateTimestamp = block.timestamp;
    }
    
    // View functions
    function getProject(uint256 _projectId) external view validProjectId(_projectId) returns (Project memory) {
        Project memory project = projects[_projectId];
        require(project.isPublic || msg.sender == project.governmentEntity || msg.sender == owner(), 
                "ProjectRegistry: Project is not public");
        return project;
    }
    
    function getProjectMilestones(uint256 _projectId) external view validProjectId(_projectId) returns (ProjectMilestone[] memory) {
        Project memory project = projects[_projectId];
        require(project.isPublic || msg.sender == project.governmentEntity || msg.sender == owner(), 
                "ProjectRegistry: Project is not public");
        return projectMilestones[_projectId];
    }
    
    function getProjectsByCategory(ProjectCategory _category) external view returns (uint256[] memory) {
        return categoryProjects[uint256(_category)];
    }
    
    function getProjectsByGovernmentEntity(address _entity) external view returns (uint256[] memory) {
        return governmentEntityProjects[_entity];
    }
    
    function getProjectsByStatus(ProjectStatus _status) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_projectIdCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _projectIdCounter; i++) {
            if (projects[i].status == _status && (projects[i].isPublic || msg.sender == owner())) {
                result[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }
        
        return finalResult;
    }
    
    function getProjectStats() external view returns (
        uint256 totalProjects,
        uint256 approvedProjects,
        uint256 inProgressProjects,
        uint256 completedProjects,
        uint256 totalBudgetAllocated,
        uint256 totalBudgetSpent
    ) {
        uint256 approved = 0;
        uint256 inProgress = 0;
        uint256 completed = 0;
        uint256 totalAllocated = 0;
        uint256 totalSpent = 0;
        
        for (uint256 i = 1; i <= _projectIdCounter; i++) {
            Project storage project = projects[i];
            
            if (project.status == ProjectStatus.APPROVED) approved++;
            else if (project.status == ProjectStatus.IN_PROGRESS) inProgress++;
            else if (project.status == ProjectStatus.COMPLETED) completed++;
            
            totalAllocated += project.totalBudget;
            totalSpent += project.budgetSpent;
        }
        
        return (_projectIdCounter, approved, inProgress, completed, totalAllocated, totalSpent);
    }
    
    function getTotalProjects() external view returns (uint256) {
        return _projectIdCounter;
    }
    
    function getProjectProgress(uint256 _projectId) external view validProjectId(_projectId) returns (
        uint256 totalMilestones,
        uint256 completedMilestones,
        uint256 budgetUtilization // percentage in basis points (10000 = 100%)
    ) {
        Project memory project = projects[_projectId];
        require(project.isPublic || msg.sender == project.governmentEntity || msg.sender == owner(), 
                "ProjectRegistry: Project is not public");
        
        ProjectMilestone[] memory milestones = projectMilestones[_projectId];
        uint256 completed = 0;
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].isCompleted) {
                completed++;
            }
        }
        
        uint256 utilization = project.totalBudget > 0 ? 
                             (project.budgetSpent * 10000) / project.totalBudget : 0;
        
        return (milestones.length, completed, utilization);
    }
    
    // Internal functions
    function _isValidStatusTransition(ProjectStatus _from, ProjectStatus _to) internal pure returns (bool) {
        if (_from == ProjectStatus.PROPOSED) {
            return _to == ProjectStatus.APPROVED || _to == ProjectStatus.CANCELLED;
        } else if (_from == ProjectStatus.APPROVED) {
            return _to == ProjectStatus.IN_PROGRESS || _to == ProjectStatus.CANCELLED;
        } else if (_from == ProjectStatus.IN_PROGRESS) {
            return _to == ProjectStatus.COMPLETED || _to == ProjectStatus.UNDER_REVIEW || _to == ProjectStatus.CANCELLED;
        } else if (_from == ProjectStatus.UNDER_REVIEW) {
            return _to == ProjectStatus.COMPLETED || _to == ProjectStatus.IN_PROGRESS;
        }
        return false; // COMPLETED and CANCELLED are final states
    }
    
    // Admin functions
    function authorizeGovernmentEntity(address _entity, bool _authorized) external onlyOwner {
        require(_entity != address(0), "ProjectRegistry: Invalid entity address");
        authorizedGovernmentEntities[_entity] = _authorized;
        emit GovernmentEntityAuthorized(_entity, _authorized, msg.sender);
    }
    
    function emergencyUpdateProject(
        uint256 _projectId,
        ProjectStatus _status,
        uint256 _newBudget
    ) external onlyOwner validProjectId(_projectId) {
        Project storage project = projects[_projectId];
        ProjectStatus oldStatus = project.status;
        
        if (_status != oldStatus) {
            project.status = _status;
            emit ProjectStatusUpdated(_projectId, oldStatus, _status, msg.sender);
        }
        
        if (_newBudget != project.totalBudget && _newBudget >= project.budgetSpent) {
            uint256 previousBudget = project.totalBudget;
            project.totalBudget = _newBudget;
            emit ProjectBudgetUpdated(_projectId, previousBudget, _newBudget, msg.sender);
        }
        
        project.lastUpdateTimestamp = block.timestamp;
    }
    
    function setProjectPublic(uint256 _projectId, bool _isPublic) external onlyOwner validProjectId(_projectId) {
        projects[_projectId].isPublic = _isPublic;
        projects[_projectId].lastUpdateTimestamp = block.timestamp;
    }
}