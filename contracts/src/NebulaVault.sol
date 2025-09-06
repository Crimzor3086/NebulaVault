// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./FileStorage.sol";
import "./AccessControl.sol";
import "./ProofVerification.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NebulaVault
 * @dev Main contract integrating FileStorage, AccessControl, and ProofVerification
 * @author NebulaVault Team
 */
contract NebulaVault is Ownable, ReentrancyGuard, Pausable {
    // Contract instances
    FileStorage public fileStorage;
    NebulaVaultAccessControl public accessControl;
    ProofVerification public proofVerification;

    // Events
    event ContractsDeployed(
        address indexed fileStorage,
        address indexed accessControl,
        address indexed proofVerification
    );

    event FileUploadedWithVerification(
        bytes32 indexed fileHash,
        address indexed uploader,
        string filename,
        uint256 size,
        bool proofSubmitted
    );

    event SystemUpgraded(
        address indexed oldContract,
        address indexed newContract,
        string contractType
    );

    // State variables
    mapping(bytes32 => bool) public verifiedUploads;
    mapping(address => uint256) public userUploadCounts;
    mapping(address => uint256) public userDownloadCounts;

    uint256 public totalUploads;
    uint256 public totalDownloads;
    uint256 public totalVerifiedFiles;

    // Modifiers
    modifier onlyRegisteredUser() {
        require(accessControl.isUserActive(msg.sender), "User not registered or inactive");
        _;
    }

    modifier onlyVerifiedFile(bytes32 fileHash) {
        require(verifiedUploads[fileHash], "File not verified");
        _;
    }

    constructor() {
        // Deploy child contracts
        fileStorage = new FileStorage();
        accessControl = new NebulaVaultAccessControl();
        proofVerification = new ProofVerification();

        // Transfer ownership of child contracts to this contract
        fileStorage.transferOwnership(address(this));
        accessControl.grantRole(accessControl.ADMIN_ROLE(), address(this));
        proofVerification.transferOwnership(address(this));

        emit ContractsDeployed(
            address(fileStorage),
            address(accessControl),
            address(proofVerification)
        );
    }

    /**
     * @dev Register a new user
     * @param username The username for the new user
     */
    function registerUser(string memory username) external {
        accessControl.registerUser(username);
    }

    /**
     * @dev Upload a file with automatic proof verification
     * @param fileHash The hash of the file content
     * @param filename The name of the file
     * @param size The size of the file in bytes
     * @param merkleRoot The Merkle root of the file chunks
     * @param proof The Merkle proof for verification
     * @param indices The indices in the Merkle tree
     * @param leafHash The hash of the leaf node
     */
    function uploadFileWithVerification(
        bytes32 fileHash,
        string memory filename,
        uint256 size,
        string memory merkleRoot,
        bytes32[] memory proof,
        uint256[] memory indices,
        bytes32 leafHash
    ) external payable onlyRegisteredUser whenNotPaused nonReentrant {
        // Upload file metadata
        fileStorage.uploadFile{value: msg.value}(
            fileHash,
            filename,
            size,
            merkleRoot
        );

        // Submit proof for verification
        proofVerification.submitProof(
            fileHash,
            bytes32(keccak256(abi.encodePacked(merkleRoot))),
            proof,
            indices,
            leafHash
        );

        // Update statistics
        userUploadCounts[msg.sender]++;
        totalUploads++;

        emit FileUploadedWithVerification(
            fileHash,
            msg.sender,
            filename,
            size,
            true
        );
    }

    /**
     * @dev Upload a file without proof verification (for trusted uploaders)
     * @param fileHash The hash of the file content
     * @param filename The name of the file
     * @param size The size of the file in bytes
     * @param merkleRoot The Merkle root of the file chunks
     */
    function uploadFile(
        bytes32 fileHash,
        string memory filename,
        uint256 size,
        string memory merkleRoot
    ) external payable onlyRegisteredUser whenNotPaused nonReentrant {
        // Upload file metadata
        fileStorage.uploadFile{value: msg.value}(
            fileHash,
            filename,
            size,
            merkleRoot
        );

        // Mark as verified for trusted uploaders
        verifiedUploads[fileHash] = true;
        totalVerifiedFiles++;

        // Update statistics
        userUploadCounts[msg.sender]++;
        totalUploads++;

        emit FileUploadedWithVerification(
            fileHash,
            msg.sender,
            filename,
            size,
            false
        );
    }

    /**
     * @dev Download a file (record access)
     * @param fileHash The hash of the file to download
     */
    function downloadFile(bytes32 fileHash) 
        external 
        onlyRegisteredUser 
        onlyVerifiedFile(fileHash) 
    {
        fileStorage.downloadFile(fileHash);
        
        // Update statistics
        userDownloadCounts[msg.sender]++;
        totalDownloads++;
    }

    /**
     * @dev Verify a file's proof
     * @param fileHash The hash of the file
     * @param merkleRoot The Merkle root to verify against
     * @param proof The Merkle proof
     * @param indices The indices in the Merkle tree
     * @param leafHash The hash of the leaf node
     */
    function verifyFileProof(
        bytes32 fileHash,
        bytes32 merkleRoot,
        bytes32[] memory proof,
        uint256[] memory indices,
        bytes32 leafHash
    ) external onlyRegisteredUser returns (bool) {
        bool isValid = proofVerification.verifyProof(
            fileHash,
            merkleRoot,
            proof,
            indices,
            leafHash
        );

        // If verification is successful, mark file as verified
        if (isValid && !verifiedUploads[fileHash]) {
            verifiedUploads[fileHash] = true;
            totalVerifiedFiles++;
        }

        return isValid;
    }

    /**
     * @dev Delete a file
     * @param fileHash The hash of the file to delete
     */
    function deleteFile(bytes32 fileHash) external onlyRegisteredUser {
        fileStorage.deleteFile(fileHash);
        
        // Remove from verified files if it was verified
        if (verifiedUploads[fileHash]) {
            verifiedUploads[fileHash] = false;
            totalVerifiedFiles--;
        }
    }

    /**
     * @dev Authorize a user for a specific file
     * @param fileHash The hash of the file
     * @param user The user to authorize
     */
    function authorizeUser(bytes32 fileHash, address user) 
        external 
        onlyRegisteredUser 
    {
        fileStorage.authorizeUser(fileHash, user);
    }

    /**
     * @dev Revoke authorization for a user
     * @param fileHash The hash of the file
     * @param user The user to revoke authorization from
     */
    function revokeUser(bytes32 fileHash, address user) 
        external 
        onlyRegisteredUser 
    {
        fileStorage.revokeUser(fileHash, user);
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function upgradeFileStorage(address newFileStorage) external onlyOwner {
        address oldContract = address(fileStorage);
        fileStorage = FileStorage(newFileStorage);
        emit SystemUpgraded(oldContract, newFileStorage, "FileStorage");
    }

    function upgradeAccessControl(address newAccessControl) external onlyOwner {
        address oldContract = address(accessControl);
        accessControl = NebulaVaultAccessControl(newAccessControl);
        emit SystemUpgraded(oldContract, newAccessControl, "AccessControl");
    }

    function upgradeProofVerification(address newProofVerification) external onlyOwner {
        address oldContract = address(proofVerification);
        proofVerification = ProofVerification(newProofVerification);
        emit SystemUpgraded(oldContract, newProofVerification, "ProofVerification");
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // View functions
    function getFileMetadata(bytes32 fileHash) 
        external 
        view 
        returns (
            bytes32,
            address,
            string memory,
            uint256,
            uint256,
            string memory,
            bool
        ) 
    {
        return fileStorage.getFileMetadata(fileHash);
    }

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
        return accessControl.getUserProfile(user);
    }

    function getVerificationResult(bytes32 fileHash) 
        external 
        view 
        returns (
            bytes32,
            bytes32,
            bool,
            uint256,
            uint256
        ) 
    {
        return proofVerification.getVerificationResult(fileHash);
    }

    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 uploads,
            uint256 downloads,
            uint256 storageUsed,
            uint256 storageQuota
        ) 
    {
        uploads = userUploadCounts[user];
        downloads = userDownloadCounts[user];
        (, , storageUsed, storageQuota) = accessControl.getUserStorageInfo(user);
    }

    function getSystemStats() 
        external 
        view 
        returns (
            uint256 totalUsers,
            uint256 totalFiles,
            uint256 totalVerified,
            uint256 totalUploadsCount,
            uint256 totalDownloadsCount
        ) 
    {
        totalUsers = accessControl.getTotalUsers();
        totalFiles = fileStorage.getTotalFiles();
        totalVerified = totalVerifiedFiles;
        totalUploadsCount = totalUploads;
        totalDownloadsCount = totalDownloads;
    }

    function isFileVerified(bytes32 fileHash) external view returns (bool) {
        return verifiedUploads[fileHash];
    }

    function isUserActive(address user) external view returns (bool) {
        return accessControl.isUserActive(user);
    }

    // Receive function to accept ETH
    receive() external payable {}
}
