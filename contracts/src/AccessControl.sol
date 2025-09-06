// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AccessControl
 * @dev Smart contract for managing user roles and permissions in NebulaVault
 * @author NebulaVault Team
 */
contract NebulaVaultAccessControl is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPLOADER_ROLE = keccak256("UPLOADER_ROLE");
    bytes32 public constant DOWNLOADER_ROLE = keccak256("DOWNLOADER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    // Events
    event UserRegistered(address indexed user, string username, uint256 timestamp);
    event UserRoleGranted(address indexed user, bytes32 role, address indexed granter);
    event UserRoleRevoked(address indexed user, bytes32 role, address indexed revoker);
    event UserSuspended(address indexed user, address indexed moderator, uint256 timestamp);
    event UserUnsuspended(address indexed user, address indexed moderator, uint256 timestamp);
    event StorageQuotaUpdated(address indexed user, uint256 newQuota, address indexed updater);

    // Structs
    struct UserProfile {
        string username;
        uint256 registrationTimestamp;
        uint256 lastActivityTimestamp;
        uint256 storageQuota; // in bytes
        uint256 storageUsed; // in bytes
        bool isSuspended;
        mapping(bytes32 => bool) permissions;
    }

    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(string => address) public usernameToAddress;
    mapping(address => bool) public registeredUsers;
    
    uint256 public totalUsers;
    uint256 public defaultStorageQuota = 1 * 1024 * 1024 * 1024; // 1GB
    uint256 public maxStorageQuota = 100 * 1024 * 1024 * 1024; // 100GB

    // Modifiers
    modifier onlyRegisteredUser() {
        require(registeredUsers[msg.sender], "User not registered");
        _;
    }

    modifier onlyActiveUser() {
        require(registeredUsers[msg.sender], "User not registered");
        require(!userProfiles[msg.sender].isSuspended, "User is suspended");
        _;
    }

    modifier validUsername(string memory username) {
        require(bytes(username).length >= 3, "Username too short");
        require(bytes(username).length <= 32, "Username too long");
        require(usernameToAddress[username] == address(0), "Username already taken");
        _;
    }

    constructor() {
        // Grant admin role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPLOADER_ROLE, msg.sender);
        _grantRole(DOWNLOADER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Register a new user
     * @param username The username for the new user
     */
    function registerUser(string memory username) 
        external 
        validUsername(username) 
        nonReentrant 
    {
        require(!registeredUsers[msg.sender], "User already registered");

        UserProfile storage profile = userProfiles[msg.sender];
        profile.username = username;
        profile.registrationTimestamp = block.timestamp;
        profile.lastActivityTimestamp = block.timestamp;
        profile.storageQuota = defaultStorageQuota;
        profile.storageUsed = 0;
        profile.isSuspended = false;

        usernameToAddress[username] = msg.sender;
        registeredUsers[msg.sender] = true;
        totalUsers++;

        // Grant basic roles to new user
        _grantRole(UPLOADER_ROLE, msg.sender);
        _grantRole(DOWNLOADER_ROLE, msg.sender);

        emit UserRegistered(msg.sender, username, block.timestamp);
    }

    /**
     * @dev Update user activity timestamp
     */
    function updateActivity() external onlyRegisteredUser {
        userProfiles[msg.sender].lastActivityTimestamp = block.timestamp;
    }

    /**
     * @dev Grant a role to a user
     * @param user The user address
     * @param role The role to grant
     */
    function grantRoleToUser(address user, bytes32 role) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        _grantRole(role, user);
        emit UserRoleGranted(user, role, msg.sender);
    }

    /**
     * @dev Revoke a role from a user
     * @param user The user address
     * @param role The role to revoke
     */
    function revokeRoleFromUser(address user, bytes32 role) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        _revokeRole(role, user);
        emit UserRoleRevoked(user, role, msg.sender);
    }

    /**
     * @dev Suspend a user
     * @param user The user to suspend
     */
    function suspendUser(address user) 
        external 
        onlyRole(MODERATOR_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        require(!userProfiles[user].isSuspended, "User already suspended");
        
        userProfiles[user].isSuspended = true;
        emit UserSuspended(user, msg.sender, block.timestamp);
    }

    /**
     * @dev Unsuspend a user
     * @param user The user to unsuspend
     */
    function unsuspendUser(address user) 
        external 
        onlyRole(MODERATOR_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        require(userProfiles[user].isSuspended, "User not suspended");
        
        userProfiles[user].isSuspended = false;
        emit UserUnsuspended(user, msg.sender, block.timestamp);
    }

    /**
     * @dev Update user storage quota
     * @param user The user address
     * @param newQuota The new storage quota in bytes
     */
    function updateStorageQuota(address user, uint256 newQuota) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        require(newQuota <= maxStorageQuota, "Quota exceeds maximum allowed");
        
        userProfiles[user].storageQuota = newQuota;
        emit StorageQuotaUpdated(user, newQuota, msg.sender);
    }

    /**
     * @dev Update user storage usage
     * @param user The user address
     * @param additionalUsage The additional storage usage in bytes
     */
    function updateStorageUsage(address user, uint256 additionalUsage) 
        external 
        onlyRole(UPLOADER_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        
        UserProfile storage profile = userProfiles[user];
        require(
            profile.storageUsed + additionalUsage <= profile.storageQuota,
            "Storage quota exceeded"
        );
        
        profile.storageUsed += additionalUsage;
    }

    /**
     * @dev Reduce user storage usage (when files are deleted)
     * @param user The user address
     * @param reduction The storage reduction in bytes
     */
    function reduceStorageUsage(address user, uint256 reduction) 
        external 
        onlyRole(UPLOADER_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        
        UserProfile storage profile = userProfiles[user];
        if (profile.storageUsed >= reduction) {
            profile.storageUsed -= reduction;
        } else {
            profile.storageUsed = 0;
        }
    }

    /**
     * @dev Set custom permission for a user
     * @param user The user address
     * @param permission The permission identifier
     * @param allowed Whether the permission is allowed
     */
    function setPermission(address user, bytes32 permission, bool allowed) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(registeredUsers[user], "User not registered");
        userProfiles[user].permissions[permission] = allowed;
    }

    // Admin functions
    function setDefaultStorageQuota(uint256 newDefaultQuota) external onlyRole(ADMIN_ROLE) {
        defaultStorageQuota = newDefaultQuota;
    }

    function setMaxStorageQuota(uint256 newMaxQuota) external onlyRole(ADMIN_ROLE) {
        maxStorageQuota = newMaxQuota;
    }

    // View functions
    function getUserProfile(address user) 
        external 
        view 
        returns (
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        ) 
    {
        require(registeredUsers[user], "User not registered");
        UserProfile storage profile = userProfiles[user];
        return (
            profile.username,
            profile.registrationTimestamp,
            profile.lastActivityTimestamp,
            profile.storageQuota,
            profile.storageUsed,
            profile.isSuspended
        );
    }

    function getUsername(address user) external view returns (string memory) {
        require(registeredUsers[user], "User not registered");
        return userProfiles[user].username;
    }

    function getUserAddress(string memory username) external view returns (address) {
        return usernameToAddress[username];
    }

    function isUserRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }

    function isUserActive(address user) external view returns (bool) {
        return registeredUsers[user] && !userProfiles[user].isSuspended;
    }

    function getUserStorageInfo(address user) 
        external 
        view 
        returns (uint256 quota, uint256 used, uint256 available) 
    {
        require(registeredUsers[user], "User not registered");
        UserProfile storage profile = userProfiles[user];
        quota = profile.storageQuota;
        used = profile.storageUsed;
        available = quota > used ? quota - used : 0;
    }

    function hasPermission(address user, bytes32 permission) external view returns (bool) {
        require(registeredUsers[user], "User not registered");
        return userProfiles[user].permissions[permission];
    }

    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }

    function getActiveUsers() external view returns (uint256) {
        // This would require iterating through all users, which is gas-intensive
        // In production, maintain a separate counter for active users
        return totalUsers; // Simplified for this example
    }
}
