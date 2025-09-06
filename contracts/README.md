# 🚀 NebulaVault Smart Contracts

**Decentralized File Storage Smart Contracts for 0G Storage Network**

## 📋 Overview

NebulaVault smart contracts provide a comprehensive solution for decentralized file storage on the 0G Storage blockchain network. The contracts handle file metadata, access control, proof verification, and user management.

## 🏗️ Contract Architecture

### **Core Contracts**

1. **NebulaVault.sol** - Main contract integrating all components
2. **FileStorage.sol** - File metadata and storage management
3. **AccessControl.sol** - User roles and permissions
4. **ProofVerification.sol** - Merkle tree proof verification

### **Contract Relationships**

```
NebulaVault (Main Contract)
├── FileStorage (File Management)
├── AccessControl (User Management)
└── ProofVerification (Proof Verification)
```

## 🔧 Features

### **File Storage Contract**
- ✅ File metadata storage on blockchain
- ✅ Merkle root tracking for data integrity
- ✅ File access control and authorization
- ✅ Storage fee management
- ✅ File lifecycle management (upload/download/delete)

### **Access Control Contract**
- ✅ User registration and profile management
- ✅ Role-based access control (Admin, Uploader, Downloader, Verifier, Moderator)
- ✅ Storage quota management
- ✅ User suspension/unsuspension
- ✅ Custom permission system

### **Proof Verification Contract**
- ✅ Merkle tree proof verification
- ✅ Batch proof verification
- ✅ Verifier reputation system
- ✅ Verification threshold management
- ✅ Proof reward distribution

### **Main NebulaVault Contract**
- ✅ Integrated file operations
- ✅ Automatic proof verification
- ✅ System statistics tracking
- ✅ Pause/unpause functionality
- ✅ Contract upgradeability

## 🚀 Deployment

### **Prerequisites**

```bash
# Install dependencies
npm install

# Install Hardhat
npm install --save-dev hardhat

# Install OpenZeppelin contracts
npm install @openzeppelin/contracts
```

### **Environment Setup**

Create a `.env` file:

```bash
# 0G Storage Network Configuration
PRIVATE_KEY=your_private_key_here
RPC_URL=https://evmrpc-testnet.0g.ai
CHAIN_ID=16601
CONTRACT_ADDRESS=0x... # Will be set after deployment
```

### **Deploy Contracts**

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet
```

### **Verify Contracts**

```bash
# Verify on block explorer
npm run verify
```

## 📊 Contract Specifications

### **Gas Estimates**

| Contract | Deployment | Upload File | Download File | Verify Proof |
|----------|------------|-------------|---------------|--------------|
| NebulaVault | ~3,000,000 | ~150,000 | ~50,000 | ~100,000 |
| FileStorage | ~2,000,000 | ~120,000 | ~30,000 | ~80,000 |
| AccessControl | ~1,500,000 | ~80,000 | ~20,000 | ~60,000 |
| ProofVerification | ~1,200,000 | ~100,000 | ~40,000 | ~90,000 |

### **Storage Costs**

- **File Metadata**: ~2,000 gas per file
- **User Profile**: ~1,500 gas per user
- **Proof Data**: ~500 gas per proof
- **Access Control**: ~300 gas per permission

## 🔐 Security Features

### **Access Control**
- Role-based permissions
- User authorization for specific files
- Admin controls for system management
- Emergency pause functionality

### **Data Integrity**
- Merkle tree verification
- Cryptographic proof validation
- Immutable file metadata
- Blockchain-based audit trail

### **Economic Security**
- Storage fees prevent spam
- Verification rewards incentivize honest behavior
- Reputation system for verifiers
- Slashing for malicious behavior

## 📝 Usage Examples

### **Deploy and Initialize**

```javascript
const NebulaVault = await ethers.getContractFactory("NebulaVault");
const nebulaVault = await NebulaVault.deploy();
await nebulaVault.waitForDeployment();

// Initialize system
await nebulaVault.accessControl().setDefaultStorageQuota(ethers.parseUnits("1", 30)); // 1GB
await nebulaVault.proofVerification().setVerificationThreshold(3);
```

### **User Registration**

```javascript
await nebulaVault.registerUser("alice");
```

### **File Upload**

```javascript
const fileHash = ethers.keccak256(ethers.toUtf8Bytes("file content"));
await nebulaVault.uploadFile(
  fileHash,
  "document.pdf",
  1024000, // 1MB
  "0x1234...",
  { value: ethers.parseEther("0.001") }
);
```

### **File Download**

```javascript
await nebulaVault.downloadFile(fileHash);
```

### **Proof Verification**

```javascript
await nebulaVault.verifyFileProof(
  fileHash,
  merkleRoot,
  proof,
  indices,
  leafHash
);
```

## 🧪 Testing

### **Run Tests**

```bash
# Run all tests
npm test

# Run with gas reporting
npm run gas-report

# Run with coverage
npm run coverage
```

### **Test Coverage**

- ✅ Contract deployment
- ✅ User registration
- ✅ File upload/download
- ✅ Access control
- ✅ Proof verification
- ✅ Admin functions
- ✅ Error handling
- ✅ Edge cases

## 📈 Monitoring

### **Events to Monitor**

```solidity
event FileUploaded(bytes32 indexed fileHash, address indexed uploader, ...);
event FileDownloaded(bytes32 indexed fileHash, address indexed downloader, ...);
event ProofVerified(bytes32 indexed fileHash, address indexed verifier, ...);
event UserRegistered(address indexed user, string username, ...);
```

### **Key Metrics**

- Total files uploaded
- Total users registered
- Verification success rate
- Average file size
- Storage utilization
- Gas usage patterns

## 🔄 Upgradeability

### **Proxy Pattern**

The contracts support upgradeability through:

- **Ownable**: Owner can upgrade contracts
- **Pausable**: Emergency pause functionality
- **ReentrancyGuard**: Protection against reentrancy attacks

### **Upgrade Process**

```javascript
// Upgrade FileStorage contract
await nebulaVault.upgradeFileStorage(newFileStorageAddress);

// Upgrade AccessControl contract
await nebulaVault.upgradeAccessControl(newAccessControlAddress);

// Upgrade ProofVerification contract
await nebulaVault.upgradeProofVerification(newProofVerificationAddress);
```

## 🌐 Network Configuration

### **0G Storage Testnet**
- **RPC URL**: `https://evmrpc-testnet.0g.ai`
- **Chain ID**: `16601`
- **Block Explorer**: `https://chainscan-galileo.0g.ai`

### **0G Storage Mainnet**
- **RPC URL**: `https://evmrpc-mainnet.0g.ai`
- **Chain ID**: `16600`
- **Block Explorer**: `https://chainscan.0g.ai`

## 📚 API Reference

### **NebulaVault Contract**

| Function | Description | Gas Cost |
|----------|-------------|----------|
| `registerUser(string)` | Register new user | ~80,000 |
| `uploadFile(...)` | Upload file metadata | ~150,000 |
| `downloadFile(bytes32)` | Record file download | ~50,000 |
| `verifyFileProof(...)` | Verify file proof | ~100,000 |
| `getFileMetadata(bytes32)` | Get file metadata | ~5,000 |
| `getUserProfile(address)` | Get user profile | ~5,000 |
| `getSystemStats()` | Get system statistics | ~10,000 |

## 🛠️ Development

### **Local Development**

```bash
# Start local Hardhat network
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### **Contract Interaction**

```bash
# Open Hardhat console
npx hardhat console --network testnet

# Interact with deployed contract
const contract = await ethers.getContractAt("NebulaVault", "0x...");
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

- **Documentation**: [README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/Crimzor3086/NebulaVault/issues)
- **Discord**: [NebulaVault Community](https://discord.gg/nebularvault)

---

**Built with ❤️ for the decentralized future**
