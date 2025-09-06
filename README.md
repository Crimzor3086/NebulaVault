# 🌌 NebularVault

<div align="center">
  <img src="https://img.shields.io/badge/Status-DEPLOYED%20ON%20BLOCKCHAIN-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/0G%20Storage-Live-orange.svg" alt="0G Storage">
  <img src="https://img.shields.io/badge/Blockchain-Active-purple.svg" alt="Blockchain">
</div>

> **🚀 LIVE ON BLOCKCHAIN**: Smart contracts deployed to 0G Storage network

**NebularVault** is a decentralized file storage system built on the **0G Storage** blockchain. It provides secure, scalable file storage with smart contracts, Merkle tree proofs, and blockchain-based access control.

## ✅ **DEPLOYED ON BLOCKCHAIN**

### 🌐 **0G Storage Testnet Deployment** ✅ **LIVE**

```bash
🚀 Smart Contract Deployment Successful!
🏠 NebulaVault: 0x5197FED3D7481eE6e10a37e7Bc23D2E8A273609d
📁 FileStorage: 0xBd6227e9d853001F3877c01849D885F8842c4c3d
🔐 AccessControl: 0x88E1fe37f1622Ff72f4d20C5f6e5293424bA5204
🛡️ ProofVerification: 0xA0bA3Ff9C05113792AD3FA007D90af2767F9C3c7
```

**Network**: 0G-Galileo-Testnet (Chain ID: 16601)  
**RPC**: `https://evmrpc-testnet.0g.ai`  
**Explorer**: `https://chainscan-galileo.0g.ai`  
**Deployer**: `0xd332ABE4395c5173E04F4cbBF39DB175C23ad0eC`

## 🚀 **Features**

- **🌐 Blockchain Storage**: Files stored on 0G Storage network
- **📋 Smart Contracts**: On-chain file metadata and access control
- **🛡️ Proof Verification**: Merkle tree proofs for data integrity
- **🔐 Access Control**: Role-based permissions on blockchain
- **💰 Economic System**: Storage fees and verification rewards
- **📱 Modern UI**: React-based interface with drag-and-drop upload

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI        │    │   Backend API   │    │   Storage Agent │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Go)          │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   0G Storage    │
                    │   Blockchain    │
                    └─────────────────┘
```

## 🚀 **Quick Start**

1. **Clone repository**
   ```bash
   git clone git@github.com:Crimzor3086/NebulaVault.git
   cd NebulaVault
   ```

2. **Install dependencies**
   ```bash
   cd packages/backend && npm install && cd ../..
   cd packages/web-ui && npm install && cd ../..
   cd packages/agent && go mod tidy && cd ../..
   ```

3. **Start services**
   ```bash
   # Terminal 1: Backend
   cd packages/backend && npm start
   
   # Terminal 2: Agent
   cd packages/agent && go run cmd/agent/main.go --config configs/config.yaml
   
   # Terminal 3: Web UI
   cd packages/web-ui && npm start
   ```

4. **Access application**
   - 🌐 Web UI: http://localhost:3000
   - 🔧 Backend API: http://localhost:4000
   - 📦 Storage Agent: http://localhost:8080

## 🧪 **Test Blockchain Integration**

```bash
# Test backend
curl http://localhost:4000/health

# Test agent
curl http://localhost:8080/health

# Test 0G Storage integration
./test_0g_integration.sh
```

## 📚 **Smart Contracts**

### **Contract Addresses on Blockchain**

| Contract | Address | Purpose |
|----------|---------|---------|
| **NebulaVault** | `0x5197FED3D7481eE6e10a37e7Bc23D2E8A273609d` | Main integration contract |
| **FileStorage** | `0xBd6227e9d853001F3877c01849D885F8842c4c3d` | File metadata management |
| **AccessControl** | `0x88E1fe37f1622Ff72f4d20C5f6e5293424bA5204` | User permissions |
| **ProofVerification** | `0xA0bA3Ff9C05113792AD3FA007D90af2767F9C3c7` | Proof validation |

### **Key Features**
- **On-Chain File Metadata**: File information stored on blockchain
- **Decentralized Access Control**: User permissions managed on-chain
- **Proof Verification**: Cryptographic proof validation system
- **Economic Incentives**: Storage fees (0.001 ETH) and verification rewards
- **Upgradeability**: Contract upgrade support

## 🔒 **Security**

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Blockchain Security**: Smart contract-based security model

## 📊 **Monitoring**

All services provide health check endpoints:
- Backend: `GET /health`
- Agent: `GET /health`
- Web UI: `GET /health`

## 🚀 **Deployment**

### **Docker Deployment**
```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```

### **Smart Contract Deployment**
```bash
cd contracts
npx hardhat run scripts/deploy.js --network testnet
```

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><a href="#nebularvault">⬆️ Back to Top</a></p>
</div>