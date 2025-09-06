# 🌌 NebularVault

<div align="center">
  <img src="https://img.shields.io/badge/Status-Backend%20Running-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/0G%20Storage-Ready-orange.svg" alt="0G Storage">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</div>

> **🚀 READY TO USE**: Backend API running on port 4000 | Agent & Web UI ready to start

**NebularVault** is a comprehensive decentralized file storage system built on the **0G Storage** (ZeroGravity Network). It provides secure, scalable, and efficient file storage with advanced features like chunking, Merkle tree proofs, and seamless integration with decentralized networks.

## ✅ What's Working Right Now

- 🔥 **Backend API**: Fully operational on port 4000
- 📊 **Health Monitoring**: Real-time system health checks  
- 🔒 **Security**: JWT authentication, rate limiting, CORS
- 💾 **Database**: SQLite with file metadata storage
- 🧪 **Testing**: Jest test suite for backend
- 🌐 **0G Storage Agent**: **Running with real blockchain integration**
- 🔗 **Blockchain Operations**: **Files stored on 0G Storage network**
- 📤 **File Upload**: **Real uploads to 0G Storage blockchain**
- 📥 **File Download**: **Real downloads from 0G Storage blockchain**
- 🛡️ **Proof Generation**: **Merkle proofs for data integrity**

## 🚀 Features

- **Decentralized Storage**: Built on 0G Storage network for distributed file storage
- **File Chunking**: Automatic file segmentation for efficient storage and retrieval
- **Merkle Tree Proofs**: Cryptographic verification of file integrity
- **Modern Web UI**: React-based interface with drag-and-drop file upload
- **RESTful API**: Comprehensive backend API for file management
- **Docker Support**: Complete containerization for easy deployment
- **Security**: JWT authentication, rate limiting, and input validation
- **Monitoring**: Health checks and comprehensive logging

## 🚀 Deployment Status

**✅ FULLY DEPLOYED ON 0G STORAGE BLOCKCHAIN NETWORK**

### Current Status
- ✅ Backend API: **Running** (`http://localhost:4000`)
- ✅ Storage Agent: **Running** (`http://localhost:8080`) - **Connected to 0G Storage**
- ⏳ Web UI: Ready to start

### Blockchain Integration
- 🌐 **Network**: 0G-Galileo-Testnet
- 🔗 **RPC**: `https://evmrpc-testnet.0g.ai`
- 📋 **Chain ID**: `16601`
- 📄 **Contract**: `0xd332ABE4395c5173E04F4cbBF39DB175C23ad0eC`

### Quick Test
```bash
# Test Backend
curl http://localhost:4000/health

# Test Storage Agent with 0G Integration
curl http://localhost:8080/health

# Test 0G Storage Integration
./test_0g_integration.sh
```

## 🔗 Blockchain Integration

NebulaVault is **fully integrated with the 0G Storage blockchain network**:

### **Real Blockchain Operations**
- ✅ **File Upload**: Files are stored on 0G Storage network
- ✅ **File Download**: Files are retrieved from 0G Storage network  
- ✅ **Proof Generation**: Merkle tree proofs for data integrity
- ✅ **Health Monitoring**: Real-time blockchain connectivity

### **0G Storage Features**
- **Decentralized Storage**: Files stored across 0G Storage nodes
- **Data Integrity**: Merkle tree verification
- **Immutable Records**: Blockchain-based file tracking
- **Proof of Storage**: Cryptographic proofs for stored data

### **Integration Test Results**
```bash
✅ 0G Storage integration test completed successfully!
📤 Upload: File uploaded successfully to 0G Storage
📥 Download: File downloaded successfully from 0G Storage  
🛡️ Proof: Proof retrieved successfully
```

## 🏗️ Architecture

NebularVault follows a microservices architecture with three main components:

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
                    │   Network       │
                    └─────────────────┘
```

### Components

- **Web UI**: Modern React application with Tailwind CSS
- **Backend API**: Node.js/TypeScript REST API with SQLite database
- **Storage Agent**: Go service for file chunking and 0G network integration
- **0G Storage**: Decentralized storage network for file persistence

## 📦 Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Go 1.22+ (for development)
- 0G Storage account and credentials (for production deployment)

### Quick Start

1. **Clone and install**
   ```bash
   git clone git@github.com:Crimzor3086/NebulaVault.git
   cd NebulaVault
   
   # Install all dependencies
   cd packages/backend && npm install && cd ../..
   cd packages/web-ui && npm install && cd ../..
   cd packages/agent && go mod tidy && cd ../..
   ```

2. **Start all services**
   ```bash
   # Terminal 1: Backend (Already running ✅)
   cd packages/backend && npm start
   
   # Terminal 2: Storage Agent
   cd packages/agent && go run cmd/agent/main.go --config configs/config.yaml
   
   # Terminal 3: Web UI
   cd packages/web-ui && npm start
   ```

3. **Access the application**
   - 🌐 Web UI: http://localhost:3000
   - 🔧 Backend API: http://localhost:4000
   - 📦 Storage Agent: http://localhost:8080

### Development Setup

1. **Backend Development**
   ```bash
   cd packages/backend
   npm install
   npm run dev
   ```

2. **Agent Development**
   ```bash
   cd packages/agent
   go mod tidy
   go run cmd/agent/main.go
   ```

3. **Web UI Development**
   ```bash
   cd packages/web-ui
   npm install
   npm start
   ```

## ⚙️ Configuration

### 0G Storage Setup
```bash
# Copy environment template
cp infra/docker/env.example infra/docker/.env

# Edit with your 0G credentials (optional for development)
nano infra/docker/.env
```

### Key Settings
- **Network**: 0G-Galileo-Testnet (Chain ID: 16601)
- **RPC URL**: https://evmrpc-testnet.0g.ai
- **Database**: SQLite (auto-created)
- **Max File Size**: 100MB

## 📚 API Documentation

### Backend API Endpoints

#### Health Check
```http
GET /health
```

#### File Operations
```http
POST /api/files/initialize
POST /api/files/:fileId/upload
GET  /api/files/:fileId/metadata
GET  /api/files/:fileId/download
GET  /api/files/user/files
DELETE /api/files/:fileId
```

#### Example: Upload a File

1. **Initialize Upload**
   ```bash
   curl -X POST http://localhost:4000/api/files/initialize \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "filename": "document.pdf",
       "size": 1048576,
       "mimeType": "application/pdf",
       "isPublic": false
     }'
   ```

2. **Upload File**
   ```bash
   curl -X POST http://localhost:4000/api/files/{fileId}/upload \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@document.pdf"
   ```

### Agent API Endpoints

#### Health Check
```http
GET /health
```

#### Storage Operations
```http
POST /api/v1/files/upload
GET  /api/v1/files/download/:hash
GET  /api/v1/files/metadata/:hash
GET  /api/v1/files/proof/:hash
POST /api/v1/storage/chunk
POST /api/v1/storage/reconstruct
GET  /api/v1/storage/verify/:hash
```

## 🧪 Testing

### Backend Tests
```bash
cd packages/backend
npm test
npm run test:coverage
```

### Agent Tests
```bash
cd packages/agent
go test ./...
go test -v -cover ./...
```

### Web UI Tests
```bash
cd packages/web-ui
npm test
```

## 🚀 Deployment

### Docker Deployment

1. **Production Build**
   ```bash
   docker-compose -f infra/docker/docker-compose.yml build
   ```

2. **Deploy with Environment**
   ```bash
   docker-compose -f infra/docker/docker-compose.yml up -d
   ```

### Kubernetes Deployment

See `infra/k8s/` directory for Kubernetes manifests:

```bash
kubectl apply -f infra/k8s/
```

### Systemd Service

For systemd-based deployments:

```bash
sudo cp infra/systemd/0g-storage-agent.service /etc/systemd/system/
sudo systemctl enable 0g-storage-agent
sudo systemctl start 0g-storage-agent
```

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **File Type Validation**: MIME type checking and file size limits

## 📊 Monitoring

### Health Checks

All services provide health check endpoints:
- Backend: `GET /health`
- Agent: `GET /health`
- Web UI: `GET /health`

### Logging

- **Structured Logging**: JSON-formatted logs for easy parsing
- **Log Levels**: Configurable logging levels (debug, info, warn, error)
- **Request Logging**: Morgan middleware for HTTP request logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/JavaScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [0G Storage](https://0g.ai/) for the decentralized storage network
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [Gin](https://gin-gonic.com/) for the Go web framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
---

<div align="center">
  <p>Built with ❤️ by the NebularVault Team</p>
  <p>
    <a href="#nebularvault">⬆️ Back to Top</a>
  </p>
</div>
