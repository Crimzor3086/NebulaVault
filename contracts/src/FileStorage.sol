// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title FileStorage
 * @dev Smart contract for managing file metadata and storage proofs on 0G Storage
 * @author NebulaVault Team
 */
contract FileStorage is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Events
    event FileUploaded(
        bytes32 indexed fileHash,
        address indexed uploader,
        string filename,
        uint256 size,
        uint256 timestamp,
        string merkleRoot
    );

    event FileDownloaded(
        bytes32 indexed fileHash,
        address indexed downloader,
        uint256 timestamp
    );

    event FileDeleted(
        bytes32 indexed fileHash,
        address indexed deleter,
        uint256 timestamp
    );

    event ProofVerified(
        bytes32 indexed fileHash,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );

    // Structs
    struct FileMetadata {
        bytes32 fileHash;
        address uploader;
        string filename;
        uint256 size;
        uint256 uploadTimestamp;
        string merkleRoot;
        bool isActive;
        mapping(address => bool) authorizedUsers;
    }

    struct StorageProof {
        bytes32 merkleRoot;
        bytes32[] proof;
        uint256[] indices;
        bool isValid;
        uint256 verificationTimestamp;
    }

    // State variables
    Counters.Counter private _fileCounter;
    mapping(bytes32 => FileMetadata) public files;
    mapping(bytes32 => StorageProof) public proofs;
    mapping(address => bytes32[]) public userFiles;
    mapping(bytes32 => address[]) public fileUsers;

    // Access control
    mapping(address => bool) public authorizedUploaders;
    mapping(address => bool) public authorizedDownloaders;
    
    // Storage configuration
    uint256 public maxFileSize = 100 * 1024 * 1024; // 100MB
    uint256 public storageFee = 0.001 ether;
    bool public publicUploadEnabled = true;

    // Modifiers
    modifier onlyAuthorizedUploader() {
        require(
            authorizedUploaders[msg.sender] || publicUploadEnabled,
            "Not authorized to upload files"
        );
        _;
    }

    modifier onlyAuthorizedDownloader() {
        require(
            authorizedDownloaders[msg.sender] || files[bytes32(0)].uploader != address(0),
            "Not authorized to download files"
        );
        _;
    }

    modifier fileExists(bytes32 fileHash) {
        require(files[fileHash].uploader != address(0), "File does not exist");
        _;
    }

    modifier fileIsActive(bytes32 fileHash) {
        require(files[fileHash].isActive, "File is not active");
        _;
    }

    constructor() {
        // Initialize with owner as authorized uploader and downloader
        authorizedUploaders[msg.sender] = true;
        authorizedDownloaders[msg.sender] = true;
    }

    /**
     * @dev Upload file metadata to the blockchain
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
    ) external payable onlyAuthorizedUploader nonReentrant {
        require(files[fileHash].uploader == address(0), "File already exists");
        require(size <= maxFileSize, "File size exceeds maximum allowed");
        require(msg.value >= storageFee, "Insufficient storage fee");

        _fileCounter.increment();

        FileMetadata storage file = files[fileHash];
        file.fileHash = fileHash;
        file.uploader = msg.sender;
        file.filename = filename;
        file.size = size;
        file.uploadTimestamp = block.timestamp;
        file.merkleRoot = merkleRoot;
        file.isActive = true;
        file.authorizedUsers[msg.sender] = true;

        // Add to user's file list
        userFiles[msg.sender].push(fileHash);
        fileUsers[fileHash].push(msg.sender);

        emit FileUploaded(
            fileHash,
            msg.sender,
            filename,
            size,
            block.timestamp,
            merkleRoot
        );
    }

    /**
     * @dev Download file metadata (record access)
     * @param fileHash The hash of the file to download
     */
    function downloadFile(bytes32 fileHash) 
        external 
        fileExists(fileHash) 
        fileIsActive(fileHash) 
        onlyAuthorizedDownloader 
    {
        FileMetadata storage file = files[fileHash];
        
        // Check if user is authorized for this specific file
        require(
            file.authorizedUsers[msg.sender] || 
            file.uploader == msg.sender || 
            authorizedDownloaders[msg.sender],
            "Not authorized to download this file"
        );

        emit FileDownloaded(fileHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Delete file metadata (soft delete)
     * @param fileHash The hash of the file to delete
     */
    function deleteFile(bytes32 fileHash) 
        external 
        fileExists(fileHash) 
        fileIsActive(fileHash) 
    {
        FileMetadata storage file = files[fileHash];
        
        require(
            file.uploader == msg.sender || msg.sender == owner(),
            "Only file owner or contract owner can delete"
        );

        file.isActive = false;

        emit FileDeleted(fileHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify storage proof for a file
     * @param fileHash The hash of the file
     * @param merkleRoot The Merkle root to verify against
     * @param proof The Merkle proof
     * @param indices The indices in the Merkle tree
     */
    function verifyProof(
        bytes32 fileHash,
        bytes32 merkleRoot,
        bytes32[] memory proof,
        uint256[] memory indices
    ) external fileExists(fileHash) returns (bool) {
        FileMetadata storage file = files[fileHash];
        
        // Simple verification - in production, implement proper Merkle tree verification
        bool isValid = (keccak256(abi.encodePacked(merkleRoot)) == keccak256(abi.encodePacked(file.merkleRoot)));
        
        StorageProof storage storageProof = proofs[fileHash];
        storageProof.merkleRoot = merkleRoot;
        storageProof.proof = proof;
        storageProof.indices = indices;
        storageProof.isValid = isValid;
        storageProof.verificationTimestamp = block.timestamp;

        emit ProofVerified(fileHash, msg.sender, isValid, block.timestamp);
        
        return isValid;
    }

    /**
     * @dev Authorize a user for a specific file
     * @param fileHash The hash of the file
     * @param user The user to authorize
     */
    function authorizeUser(bytes32 fileHash, address user) 
        external 
        fileExists(fileHash) 
    {
        FileMetadata storage file = files[fileHash];
        
        require(
            file.uploader == msg.sender || msg.sender == owner(),
            "Only file owner or contract owner can authorize users"
        );

        file.authorizedUsers[user] = true;
        
        // Add to file users list if not already present
        bool userExists = false;
        for (uint256 i = 0; i < fileUsers[fileHash].length; i++) {
            if (fileUsers[fileHash][i] == user) {
                userExists = true;
                break;
            }
        }
        
        if (!userExists) {
            fileUsers[fileHash].push(user);
        }
    }

    /**
     * @dev Revoke authorization for a user
     * @param fileHash The hash of the file
     * @param user The user to revoke authorization from
     */
    function revokeUser(bytes32 fileHash, address user) 
        external 
        fileExists(fileHash) 
    {
        FileMetadata storage file = files[fileHash];
        
        require(
            file.uploader == msg.sender || msg.sender == owner(),
            "Only file owner or contract owner can revoke users"
        );

        file.authorizedUsers[user] = false;
    }

    // Admin functions
    function setAuthorizedUploader(address uploader, bool authorized) external onlyOwner {
        authorizedUploaders[uploader] = authorized;
    }

    function setAuthorizedDownloader(address downloader, bool authorized) external onlyOwner {
        authorizedDownloaders[downloader] = authorized;
    }

    function setMaxFileSize(uint256 newMaxSize) external onlyOwner {
        maxFileSize = newMaxSize;
    }

    function setStorageFee(uint256 newFee) external onlyOwner {
        storageFee = newFee;
    }

    function setPublicUploadEnabled(bool enabled) external onlyOwner {
        publicUploadEnabled = enabled;
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }

    // View functions
    function getFileMetadata(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
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
        FileMetadata storage file = files[fileHash];
        return (
            file.fileHash,
            file.uploader,
            file.filename,
            file.size,
            file.uploadTimestamp,
            file.merkleRoot,
            file.isActive
        );
    }

    function getUserFiles(address user) external view returns (bytes32[] memory) {
        return userFiles[user];
    }

    function getFileUsers(bytes32 fileHash) external view returns (address[] memory) {
        return fileUsers[fileHash];
    }

    function getTotalFiles() external view returns (uint256) {
        return _fileCounter.current();
    }

    function isUserAuthorized(bytes32 fileHash, address user) external view returns (bool) {
        return files[fileHash].authorizedUsers[user];
    }

    function getProof(bytes32 fileHash) 
        external 
        view 
        fileExists(fileHash) 
        returns (
            bytes32,
            bytes32[] memory,
            uint256[] memory,
            bool,
            uint256
        ) 
    {
        StorageProof storage proof = proofs[fileHash];
        return (
            proof.merkleRoot,
            proof.proof,
            proof.indices,
            proof.isValid,
            proof.verificationTimestamp
        );
    }
}
