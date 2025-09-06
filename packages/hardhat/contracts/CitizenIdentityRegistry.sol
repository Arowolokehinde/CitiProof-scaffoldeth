// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CitizenIdentityRegistry
 * @dev Manages verified citizen identities and their verification levels
 * @author CitiProof Team
 */
contract CitizenIdentityRegistry is Ownable, ReentrancyGuard {
    // Counter for citizen IDs (using simple uint256 instead of Counters)
    uint256 private _citizenIdCounter;

    // Verification levels
    enum VerificationLevel {
        UNVERIFIED,    // Default state
        BASIC,         // Basic wallet connection + EFP
        VERIFIED,      // Enhanced verification (50+ EFP followers)
        PREMIUM        // Government-verified or high reputation
    }

    // Citizen profile structure
    struct CitizenProfile {
        uint256 citizenId;
        address walletAddress;
        string ensName;              // ENS name if available
        string efpTokenId;           // EFP list token ID
        uint256 efpFollowers;        // EFP follower count
        uint256 efpFollowing;        // EFP following count
        VerificationLevel verificationLevel;
        uint256 registrationTimestamp;
        uint256 lastUpdateTimestamp;
        bool isActive;
        uint256 reputationScore;     // Link to reputation contract
        string ipfsMetadata;         // Additional profile data on IPFS
    }

    // Storage mappings
    mapping(address => uint256) public walletToCitizenId;
    mapping(uint256 => CitizenProfile) public citizens;
    mapping(string => uint256) public ensNameToCitizenId;
    mapping(string => bool) public registeredEnsNames;

    // Events
    event CitizenRegistered(
        uint256 indexed citizenId,
        address indexed walletAddress,
        string ensName,
        VerificationLevel verificationLevel
    );

    event CitizenVerificationUpdated(
        uint256 indexed citizenId,
        address indexed walletAddress,
        VerificationLevel oldLevel,
        VerificationLevel newLevel
    );

    event CitizenProfileUpdated(
        uint256 indexed citizenId,
        address indexed walletAddress,
        string ensName,
        string efpTokenId
    );

    event CitizenDeactivated(
        uint256 indexed citizenId,
        address indexed walletAddress,
        address indexed deactivatedBy
    );

    // Modifiers
    modifier onlyRegisteredCitizen() {
        require(walletToCitizenId[msg.sender] != 0, "CitizenRegistry: Caller is not a registered citizen");
        require(citizens[walletToCitizenId[msg.sender]].isActive, "CitizenRegistry: Citizen account is not active");
        _;
    }

    modifier validCitizenId(uint256 _citizenId) {
        require(_citizenId > 0 && _citizenId <= _citizenIdCounter, "CitizenRegistry: Invalid citizen ID");
        _;
    }

    modifier onlyActiveCitizen(uint256 _citizenId) {
        require(citizens[_citizenId].isActive, "CitizenRegistry: Citizen is not active");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Register a new citizen with flexible requirements
     * @param _ensName ENS name (can be empty string for wallet-only registration)
     * @param _efpTokenId EFP list token ID (can be empty string)
     * @param _efpFollowers Number of EFP followers (0 allowed for new users)
     * @param _efpFollowing Number of EFP following (0 allowed for new users)
     * @param _ipfsMetadata IPFS hash for additional profile data
     */
    function registerCitizen(
        string memory _ensName,
        string memory _efpTokenId,
        uint256 _efpFollowers,
        uint256 _efpFollowing,
        string memory _ipfsMetadata
    ) external nonReentrant {
        require(walletToCitizenId[msg.sender] == 0, "CitizenRegistry: Wallet already registered");
        
        // Check if ENS name is already taken (if provided)
        if (bytes(_ensName).length > 0) {
            require(!registeredEnsNames[_ensName], "CitizenRegistry: ENS name already registered");
        }

        // Increment citizen ID counter
        _citizenIdCounter++;
        uint256 newCitizenId = _citizenIdCounter;

        // Determine verification level based on EFP data
        VerificationLevel verificationLevel = _determineVerificationLevel(_efpFollowers, _efpFollowing);

        // Create citizen profile
        citizens[newCitizenId] = CitizenProfile({
            citizenId: newCitizenId,
            walletAddress: msg.sender,
            ensName: _ensName,
            efpTokenId: _efpTokenId,
            efpFollowers: _efpFollowers,
            efpFollowing: _efpFollowing,
            verificationLevel: verificationLevel,
            registrationTimestamp: block.timestamp,
            lastUpdateTimestamp: block.timestamp,
            isActive: true,
            reputationScore: 0, // Will be updated by reputation contract
            ipfsMetadata: _ipfsMetadata
        });

        // Update mappings
        walletToCitizenId[msg.sender] = newCitizenId;
        if (bytes(_ensName).length > 0) {
            ensNameToCitizenId[_ensName] = newCitizenId;
            registeredEnsNames[_ensName] = true;
        }

        emit CitizenRegistered(newCitizenId, msg.sender, _ensName, verificationLevel);
    }

    /**
     * @dev Simplified registration for wallet-only users (hackathon-friendly)
     * Automatically generates ENS subdomain and placeholder EFP data
     */
    function registerCitizenSimple() external nonReentrant {
        require(walletToCitizenId[msg.sender] == 0, "CitizenRegistry: Wallet already registered");

        // Generate automatic ENS subdomain using last 6 chars of address
        string memory addressSuffix = Strings.toHexString(uint160(msg.sender) & 0xFFFFFF, 3);
        string memory autoEnsName = string(abi.encodePacked("citizen", addressSuffix, ".citiproof.eth"));
        
        // Ensure generated name is unique (highly unlikely to collide)
        require(!registeredEnsNames[autoEnsName], "CitizenRegistry: Generated ENS name collision");

        // Create with minimal verification data (can be updated later)
        _citizenIdCounter++;
        uint256 newCitizenId = _citizenIdCounter;

        citizens[newCitizenId] = CitizenProfile({
            citizenId: newCitizenId,
            walletAddress: msg.sender,
            ensName: autoEnsName,
            efpTokenId: "", // Can be added later
            efpFollowers: 0,
            efpFollowing: 0,
            verificationLevel: VerificationLevel.UNVERIFIED,
            registrationTimestamp: block.timestamp,
            lastUpdateTimestamp: block.timestamp,
            isActive: true,
            reputationScore: 0,
            ipfsMetadata: ""
        });

        // Update mappings
        walletToCitizenId[msg.sender] = newCitizenId;
        ensNameToCitizenId[autoEnsName] = newCitizenId;
        registeredEnsNames[autoEnsName] = true;

        emit CitizenRegistered(newCitizenId, msg.sender, autoEnsName, VerificationLevel.UNVERIFIED);
    }

    /**
     * @dev Update citizen's EFP verification data
     * @param _efpTokenId New EFP token ID
     * @param _efpFollowers Updated follower count
     * @param _efpFollowing Updated following count
     */
    function updateEFPVerification(
        string memory _efpTokenId,
        uint256 _efpFollowers,
        uint256 _efpFollowing
    ) external onlyRegisteredCitizen {
        uint256 citizenId = walletToCitizenId[msg.sender];
        CitizenProfile storage citizen = citizens[citizenId];

        VerificationLevel oldLevel = citizen.verificationLevel;
        VerificationLevel newLevel = _determineVerificationLevel(_efpFollowers, _efpFollowing);

        // Update EFP data
        citizen.efpTokenId = _efpTokenId;
        citizen.efpFollowers = _efpFollowers;
        citizen.efpFollowing = _efpFollowing;
        citizen.verificationLevel = newLevel;
        citizen.lastUpdateTimestamp = block.timestamp;

        if (oldLevel != newLevel) {
            emit CitizenVerificationUpdated(citizenId, msg.sender, oldLevel, newLevel);
        }

        emit CitizenProfileUpdated(citizenId, msg.sender, citizen.ensName, _efpTokenId);
    }

    /**
     * @dev Update citizen's ENS name
     * @param _ensName New ENS name
     */
    function updateENSName(string memory _ensName) external onlyRegisteredCitizen {
        require(bytes(_ensName).length > 0, "CitizenRegistry: ENS name cannot be empty");
        require(!registeredEnsNames[_ensName], "CitizenRegistry: ENS name already registered");

        uint256 citizenId = walletToCitizenId[msg.sender];
        CitizenProfile storage citizen = citizens[citizenId];

        // Remove old ENS name from registry
        if (bytes(citizen.ensName).length > 0) {
            registeredEnsNames[citizen.ensName] = false;
            delete ensNameToCitizenId[citizen.ensName];
        }

        // Set new ENS name
        citizen.ensName = _ensName;
        citizen.lastUpdateTimestamp = block.timestamp;
        ensNameToCitizenId[_ensName] = citizenId;
        registeredEnsNames[_ensName] = true;

        emit CitizenProfileUpdated(citizenId, msg.sender, _ensName, citizen.efpTokenId);
    }

    /**
     * @dev Update reputation score (only called by reputation contract)
     * @param _citizenId Citizen ID
     * @param _reputationScore New reputation score
     */
    function updateReputationScore(
        uint256 _citizenId,
        uint256 _reputationScore
    ) external validCitizenId(_citizenId) {
        // TODO: Add access control for reputation contract
        // require(msg.sender == reputationContract, "CitizenRegistry: Only reputation contract can update scores");
        
        citizens[_citizenId].reputationScore = _reputationScore;
        citizens[_citizenId].lastUpdateTimestamp = block.timestamp;

        // Check if reputation score qualifies for premium verification
        if (_reputationScore >= 1000 && citizens[_citizenId].verificationLevel != VerificationLevel.PREMIUM) {
            VerificationLevel oldLevel = citizens[_citizenId].verificationLevel;
            citizens[_citizenId].verificationLevel = VerificationLevel.PREMIUM;
            emit CitizenVerificationUpdated(
                _citizenId, 
                citizens[_citizenId].walletAddress, 
                oldLevel, 
                VerificationLevel.PREMIUM
            );
        }
    }

    /**
     * @dev Deactivate a citizen account (admin function)
     * @param _citizenId Citizen ID to deactivate
     */
    function deactivateCitizen(uint256 _citizenId) external onlyOwner validCitizenId(_citizenId) {
        citizens[_citizenId].isActive = false;
        citizens[_citizenId].lastUpdateTimestamp = block.timestamp;

        emit CitizenDeactivated(
            _citizenId,
            citizens[_citizenId].walletAddress,
            msg.sender
        );
    }

    /**
     * @dev Reactivate a citizen account (admin function)
     * @param _citizenId Citizen ID to reactivate
     */
    function reactivateCitizen(uint256 _citizenId) external onlyOwner validCitizenId(_citizenId) {
        citizens[_citizenId].isActive = true;
        citizens[_citizenId].lastUpdateTimestamp = block.timestamp;
    }

    // View functions
    function getCitizen(uint256 _citizenId) external view validCitizenId(_citizenId) returns (CitizenProfile memory) {
        return citizens[_citizenId];
    }

    function getCitizenByWallet(address _wallet) external view returns (CitizenProfile memory) {
        uint256 citizenId = walletToCitizenId[_wallet];
        require(citizenId != 0, "CitizenRegistry: Wallet not registered");
        return citizens[citizenId];
    }

    function getCitizenByENS(string memory _ensName) external view returns (CitizenProfile memory) {
        uint256 citizenId = ensNameToCitizenId[_ensName];
        require(citizenId != 0, "CitizenRegistry: ENS name not registered");
        return citizens[citizenId];
    }

    function isCitizenRegistered(address _wallet) external view returns (bool) {
        return walletToCitizenId[_wallet] != 0 && citizens[walletToCitizenId[_wallet]].isActive;
    }

    function getTotalCitizens() external view returns (uint256) {
        return _citizenIdCounter;
    }

    function getVerificationLevel(address _wallet) external view returns (VerificationLevel) {
        uint256 citizenId = walletToCitizenId[_wallet];
        require(citizenId != 0, "CitizenRegistry: Wallet not registered");
        return citizens[citizenId].verificationLevel;
    }

    function isENSNameAvailable(string memory _ensName) external view returns (bool) {
        return !registeredEnsNames[_ensName];
    }

    // Internal functions
    function _determineVerificationLevel(uint256 _followers, uint256 _following) internal pure returns (VerificationLevel) {
        if (_followers == 0 && _following == 0) {
            return VerificationLevel.UNVERIFIED;
        } else if (_followers < 50) {
            return VerificationLevel.BASIC;
        } else {
            return VerificationLevel.VERIFIED;
        }
    }

    // Batch operations for efficiency
    function getCitizensBatch(uint256[] memory _citizenIds) 
        external 
        view 
        returns (CitizenProfile[] memory) 
    {
        CitizenProfile[] memory profiles = new CitizenProfile[](_citizenIds.length);
        for (uint256 i = 0; i < _citizenIds.length; i++) {
            if (_citizenIds[i] > 0 && _citizenIds[i] <= _citizenIdCounter) {
                profiles[i] = citizens[_citizenIds[i]];
            }
        }
        return profiles;
    }

    function getActiveCitizensCount() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _citizenIdCounter; i++) {
            if (citizens[i].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }
}