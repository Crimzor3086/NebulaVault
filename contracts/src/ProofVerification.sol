// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ProofVerification
 * @dev Smart contract for verifying Merkle tree proofs and data integrity
 * @author NebulaVault Team
 */
contract ProofVerification is Ownable, ReentrancyGuard {
    // Events
    event ProofVerified(
        bytes32 indexed fileHash,
        bytes32 indexed merkleRoot,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );

    event ProofSubmitted(
        bytes32 indexed fileHash,
        bytes32 indexed merkleRoot,
        address indexed submitter,
        uint256 timestamp
    );

    event VerificationThresholdUpdated(uint256 newThreshold);

    // Structs
    struct VerificationResult {
        bytes32 fileHash;
        bytes32 merkleRoot;
        bool isValid;
        uint256 verificationCount;
        uint256 timestamp;
        mapping(address => bool) verifiers;
    }

    struct MerkleProof {
        bytes32[] proof;
        uint256[] indices;
        bytes32 leafHash;
        bytes32 rootHash;
    }

    // State variables
    mapping(bytes32 => VerificationResult) public verificationResults;
    mapping(bytes32 => MerkleProof) public merkleProofs;
    mapping(address => uint256) public verifierReputation;
    mapping(bytes32 => bool) public verifiedFiles;

    uint256 public verificationThreshold = 3; // Minimum verifications required
    uint256 public verificationReward = 0.001 ether;
    uint256 public maxProofLength = 1000;

    // Modifiers
    modifier validProof(bytes32[] memory proof, uint256[] memory indices) {
        require(proof.length > 0, "Proof cannot be empty");
        require(indices.length > 0, "Indices cannot be empty");
        require(proof.length == indices.length, "Proof and indices length mismatch");
        require(proof.length <= maxProofLength, "Proof too long");
        _;
    }

    /**
     * @dev Submit a Merkle proof for verification
     * @param fileHash The hash of the file
     * @param merkleRoot The Merkle root of the file
     * @param proof The Merkle proof
     * @param indices The indices in the Merkle tree
     * @param leafHash The hash of the leaf node
     */
    function submitProof(
        bytes32 fileHash,
        bytes32 merkleRoot,
        bytes32[] memory proof,
        uint256[] memory indices,
        bytes32 leafHash
    ) external validProof(proof, indices) nonReentrant {
        require(!verifiedFiles[fileHash], "File already verified");

        // Store the Merkle proof
        MerkleProof storage merkleProof = merkleProofs[fileHash];
        merkleProof.proof = proof;
        merkleProof.indices = indices;
        merkleProof.leafHash = leafHash;
        merkleProof.rootHash = merkleRoot;

        emit ProofSubmitted(fileHash, merkleRoot, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a Merkle proof
     * @param fileHash The hash of the file
     * @param merkleRoot The Merkle root to verify against
     * @param proof The Merkle proof
     * @param indices The indices in the Merkle tree
     * @param leafHash The hash of the leaf node
     */
    function verifyProof(
        bytes32 fileHash,
        bytes32 merkleRoot,
        bytes32[] memory proof,
        uint256[] memory indices,
        bytes32 leafHash
    ) external validProof(proof, indices) returns (bool) {
        require(!verifiedFiles[fileHash], "File already verified");

        bool isValid = _verifyMerkleProof(merkleRoot, proof, indices, leafHash);

        VerificationResult storage result = verificationResults[fileHash];
        
        // Initialize if first verification
        if (result.fileHash == bytes32(0)) {
            result.fileHash = fileHash;
            result.merkleRoot = merkleRoot;
            result.timestamp = block.timestamp;
        }

        // Check if verifier already verified this file
        require(!result.verifiers[msg.sender], "Already verified by this address");

        result.verifiers[msg.sender] = true;
        result.verificationCount++;

        // If verification is valid, increment reputation
        if (isValid) {
            verifierReputation[msg.sender]++;
        } else {
            // Decrement reputation for invalid verification
            if (verifierReputation[msg.sender] > 0) {
                verifierReputation[msg.sender]--;
            }
        }

        // Check if enough verifications reached
        if (result.verificationCount >= verificationThreshold) {
            result.isValid = isValid;
            verifiedFiles[fileHash] = isValid;
            
            // Distribute rewards to verifiers
            _distributeRewards(fileHash);
        }

        emit ProofVerified(fileHash, merkleRoot, msg.sender, isValid, block.timestamp);
        
        return isValid;
    }

    /**
     * @dev Internal function to verify Merkle proof
     * @param root The Merkle root
     * @param proof The Merkle proof
     * @param indices The indices in the Merkle tree
     * @param leaf The leaf hash
     */
    function _verifyMerkleProof(
        bytes32 root,
        bytes32[] memory proof,
        uint256[] memory indices,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            if (indices[i] == 0) {
                // Left child
                computedHash = keccak256(abi.encodePacked(proof[i], computedHash));
            } else {
                // Right child
                computedHash = keccak256(abi.encodePacked(computedHash, proof[i]));
            }
        }

        return computedHash == root;
    }

    /**
     * @dev Distribute rewards to verifiers
     * @param fileHash The hash of the verified file
     */
    function _distributeRewards(bytes32 fileHash) internal {
        VerificationResult storage result = verificationResults[fileHash];
        
        // Calculate reward per verifier
        uint256 totalReward = verificationReward * result.verificationCount;
        uint256 rewardPerVerifier = totalReward / result.verificationCount;

        // Note: In a real implementation, you would iterate through verifiers
        // and transfer rewards. This is simplified for gas efficiency.
        
        // For now, just emit an event
        emit VerificationThresholdUpdated(result.verificationCount);
    }

    /**
     * @dev Batch verify multiple proofs
     * @param fileHashes Array of file hashes
     * @param merkleRoots Array of Merkle roots
     * @param proofs Array of proofs
     * @param indicesArray Array of indices arrays
     * @param leafHashes Array of leaf hashes
     */
    function batchVerifyProofs(
        bytes32[] memory fileHashes,
        bytes32[] memory merkleRoots,
        bytes32[][] memory proofs,
        uint256[][] memory indicesArray,
        bytes32[] memory leafHashes
    ) external {
        require(
            fileHashes.length == merkleRoots.length &&
            fileHashes.length == proofs.length &&
            fileHashes.length == indicesArray.length &&
            fileHashes.length == leafHashes.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < fileHashes.length; i++) {
            verifyProof(
                fileHashes[i],
                merkleRoots[i],
                proofs[i],
                indicesArray[i],
                leafHashes[i]
            );
        }
    }

    /**
     * @dev Get verification result for a file
     * @param fileHash The hash of the file
     */
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
        VerificationResult storage result = verificationResults[fileHash];
        return (
            result.fileHash,
            result.merkleRoot,
            result.isValid,
            result.verificationCount,
            result.timestamp
        );
    }

    /**
     * @dev Get Merkle proof for a file
     * @param fileHash The hash of the file
     */
    function getMerkleProof(bytes32 fileHash) 
        external 
        view 
        returns (
            bytes32[] memory,
            uint256[] memory,
            bytes32,
            bytes32
        ) 
    {
        MerkleProof storage proof = merkleProofs[fileHash];
        return (
            proof.proof,
            proof.indices,
            proof.leafHash,
            proof.rootHash
        );
    }

    /**
     * @dev Check if a file is verified
     * @param fileHash The hash of the file
     */
    function isFileVerified(bytes32 fileHash) external view returns (bool) {
        return verifiedFiles[fileHash];
    }

    /**
     * @dev Get verifier reputation
     * @param verifier The verifier address
     */
    function getVerifierReputation(address verifier) external view returns (uint256) {
        return verifierReputation[verifier];
    }

    // Admin functions
    function setVerificationThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than 0");
        verificationThreshold = newThreshold;
        emit VerificationThresholdUpdated(newThreshold);
    }

    function setVerificationReward(uint256 newReward) external onlyOwner {
        verificationReward = newReward;
    }

    function setMaxProofLength(uint256 newMaxLength) external onlyOwner {
        require(newMaxLength > 0, "Max length must be greater than 0");
        maxProofLength = newMaxLength;
    }

    function withdrawRewards() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No rewards to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Emergency function to mark a file as verified
     * @param fileHash The hash of the file
     * @param isValid Whether the verification is valid
     */
    function emergencyVerify(bytes32 fileHash, bool isValid) external onlyOwner {
        verifiedFiles[fileHash] = isValid;
        
        VerificationResult storage result = verificationResults[fileHash];
        result.fileHash = fileHash;
        result.isValid = isValid;
        result.timestamp = block.timestamp;
        result.verificationCount = 1;
    }
}
