# 🚀 NebulaVault Smart Contract Deployment Guide

## 📋 Overview

This guide will walk you through deploying NebulaVault smart contracts to the 0G Storage blockchain network.

## 🎯 **DEPLOYMENT STATUS: READY FOR BLOCKCHAIN DEPLOYMENT**

**Smart Contracts Created**: ✅  
**Deployment Scripts**: ✅  
**Testing Suite**: ✅  
**Integration Code**: ✅  

---

## 🏗️ **Smart Contract Architecture**

### **Contracts Created**

1. **NebulaVault.sol** - Main integration contract
2. **FileStorage.sol** - File metadata and storage management
3. **AccessControl.sol** - User roles and permissions
4. **ProofVerification.sol** - Merkle tree proof verification

### **Key Features**

- ✅ **File Metadata Storage**: On-chain file information
- ✅ **Access Control**: Role-based user permissions
- ✅ **Proof Verification**: Merkle tree validation
- ✅ **Storage Fees**: Economic incentives
- ✅ **Upgradeability**: Contract upgrade support
- ✅ **Pause Functionality**: Emergency controls

---

## 🚀 **Deployment Steps**

### **Step 1: Install Dependencies**

```bash
cd contracts
npm install
```

### **Step 2: Configure Environment**

Create `.env` file:

```bash
# 0G Storage Testnet Configuration
PRIVATE_KEY=31cf0f5d515e3121ef1e48c2bf528c40acc22c6415a1027c304fa3064b3ddab8
RPC_URL=https://evmrpc-testnet.0g.ai
CHAIN_ID=16601
CONTRACT_ADDRESS=0xd332ABE4395c5173E04F4cbBF39DB175C23ad0eC
```

### **Step 3: Compile Contracts**

```bash
npm run compile
```

### **Step 4: Run Tests**

```bash
npm run test
```

### **Step 5: Deploy to 0G Testnet**

```bash
npm run deploy:testnet
```

---

## 📊 **Deployment Output**

### **Expected Contract Addresses**

After deployment, you'll get:

```bash
🚀 Starting NebulaVault Smart Contract Deployment...
==================================================

📝 Deploying contracts with account: 0x...
💰 Account balance: 0.1 ETH

📦 Deploying NebulaVault main contract...
✅ NebulaVault deployed to: 0x...

📋 Contract Addresses:
=====================
🏠 NebulaVault (Main): 0x...
📁 FileStorage: 0x...
🔐 AccessControl: 0x...
🛡️  ProofVerification: 0x...

⚙️  Initializing system...
✅ Default storage quota set to 1GB
✅ Max storage quota set to 100GB
✅ Verification threshold set to 3
✅ Storage fee set to 0.001 ETH

🎉 Deployment completed successfully!
```

---

## 🔧 **Integration with Agent**

### **Update Agent Configuration**

Update `packages/agent/configs/config.yaml`:

```yaml
contracts:
  nebula_vault_address: "0x..." # From deployment
  file_storage_address: "0x..." # From deployment
  access_control_address: "0x..." # From deployment
  proof_verification_address: "0x..." # From deployment
  gas_limit: 500000
  gas_price: "20000000000" # 20 Gwei
```

### **Update Agent Code**

The agent now has contract integration code in:
- `packages/agent/internal/contracts/client.go`

### **Test Integration**

```bash
# Test contract connection
curl http://localhost:8080/api/v1/contracts/health

# Test file upload to blockchain
curl -X POST http://localhost:8080/api/v1/contracts/upload \
  -H "Content-Type: application/json" \
  -d '{"fileHash":"0x...","filename":"test.txt","size":1000}'
```

---

## 🧪 **Testing Smart Contracts**

### **Test Coverage**

- ✅ Contract deployment
- ✅ User registration
- ✅ File upload/download
- ✅ Access control
- ✅ Proof verification
- ✅ Admin functions
- ✅ Error handling

### **Run Tests**

```bash
npm test
```

### **Gas Reporting**

```bash
npm run gas-report
```

---

## 📈 **Monitoring Deployment**

### **Block Explorer**

Monitor your contracts on:
- **Testnet**: https://chainscan-galileo.0g.ai
- **Mainnet**: https://chainscan.0g.ai

### **Key Events to Monitor**

```solidity
event FileUploaded(bytes32 indexed fileHash, address indexed uploader, ...);
event FileDownloaded(bytes32 indexed fileHash, address indexed downloader, ...);
event ProofVerified(bytes32 indexed fileHash, address indexed verifier, ...);
event UserRegistered(address indexed user, string username, ...);
```

---

## 🔐 **Security Considerations**

### **Access Control**

- ✅ Owner controls for critical functions
- ✅ Role-based permissions
- ✅ User authorization for files
- ✅ Emergency pause functionality

### **Economic Security**

- ✅ Storage fees prevent spam
- ✅ Verification rewards
- ✅ Reputation system
- ✅ Slashing mechanisms

---

## 🚀 **Production Deployment**

### **Mainnet Deployment**

```bash
# Update .env for mainnet
RPC_URL=https://evmrpc-mainnet.0g.ai
CHAIN_ID=16600

# Deploy to mainnet
npm run deploy:mainnet
```

### **Verification**

```bash
# Verify contracts on block explorer
npm run verify
```

---

## 📊 **Gas Estimates**

| Operation | Gas Cost | ETH Cost (20 Gwei) |
|-----------|----------|-------------------|
| Deploy NebulaVault | ~3,000,000 | ~0.06 ETH |
| Upload File | ~150,000 | ~0.003 ETH |
| Download File | ~50,000 | ~0.001 ETH |
| Verify Proof | ~100,000 | ~0.002 ETH |
| Register User | ~80,000 | ~0.0016 ETH |

---

## 🎯 **Next Steps After Deployment**

1. **Update Agent Configuration** with contract addresses
2. **Test Contract Integration** with the storage agent
3. **Deploy Frontend** to interact with contracts
4. **Monitor Contract Activity** on block explorer
5. **Set Up Monitoring** for contract events
6. **Configure Alerts** for critical events

---

## 📞 **Support**

- **Documentation**: [contracts/README.md](contracts/README.md)
- **Issues**: [GitHub Issues](https://github.com/Crimzor3086/NebulaVault/issues)
- **Discord**: [NebulaVault Community](https://discord.gg/nebularvault)

---

## 🏆 **Deployment Checklist**

- [ ] Install dependencies
- [ ] Configure environment
- [ ] Compile contracts
- [ ] Run tests
- [ ] Deploy to testnet
- [ ] Verify contracts
- [ ] Update agent configuration
- [ ] Test integration
- [ ] Deploy to mainnet (when ready)
- [ ] Set up monitoring

---

**🎉 Your NebulaVault smart contracts are ready for blockchain deployment!**

*Built for the decentralized future with ❤️*
