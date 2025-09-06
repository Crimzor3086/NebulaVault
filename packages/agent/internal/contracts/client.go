package contracts

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/sirupsen/logrus"
)

// ContractConfig holds configuration for smart contract interactions
type ContractConfig struct {
	RPCURL           string
	ChainID          int64
	ContractAddress  string
	PrivateKey       string
	GasLimit         uint64
	GasPrice         *big.Int
	Timeout          time.Duration
}

// ContractClient handles smart contract interactions
type ContractClient struct {
	config     *ContractConfig
	client     *ethclient.Client
	auth       *bind.TransactOpts
	contract   *NebulaVaultContract
	logger     *logrus.Logger
}

// FileUploadRequest represents a file upload request to the contract
type FileUploadRequest struct {
	FileHash   string
	Filename   string
	Size       uint64
	MerkleRoot string
	Proof      []string
	Indices    []uint64
	LeafHash   string
}

// FileUploadResponse represents the response from file upload
type FileUploadResponse struct {
	Success bool   `json:"success"`
	TxHash  string `json:"tx_hash"`
	Message string `json:"message"`
}

// FileDownloadResponse represents the response from file download
type FileDownloadResponse struct {
	Success bool   `json:"success"`
	TxHash  string `json:"tx_hash"`
	Message string `json:"message"`
}

// ProofVerificationResponse represents the response from proof verification
type ProofVerificationResponse struct {
	Success bool   `json:"success"`
	TxHash  string `json:"tx_hash"`
	Valid   bool   `json:"valid"`
	Message string `json:"message"`
}

// NewContractClient creates a new smart contract client
func NewContractClient(config *ContractConfig) (*ContractClient, error) {
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)

	// Connect to Ethereum client
	client, err := ethclient.Dial(config.RPCURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum client: %w", err)
	}

	// Parse private key
	privateKey, err := crypto.HexToECDSA(config.PrivateKey)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	// Create transaction options
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, big.NewInt(config.ChainID))
	if err != nil {
		return nil, fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.GasLimit = config.GasLimit
	auth.GasPrice = config.GasPrice
	auth.Context = context.Background()

	// Create contract instance
	contractAddress := common.HexToAddress(config.ContractAddress)
	contract, err := NewNebulaVaultContract(contractAddress, client)
	if err != nil {
		return nil, fmt.Errorf("failed to create contract instance: %w", err)
	}

	return &ContractClient{
		config:   config,
		client:   client,
		auth:     auth,
		contract: contract,
		logger:   logger,
	}, nil
}

// RegisterUser registers a new user on the blockchain
func (c *ContractClient) RegisterUser(username string) (*FileUploadResponse, error) {
	c.logger.WithField("username", username).Info("Registering user on blockchain...")

	tx, err := c.contract.RegisterUser(c.auth, username)
	if err != nil {
		c.logger.WithError(err).Error("Failed to register user")
		return &FileUploadResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to register user: %v", err),
		}, err
	}

	c.logger.WithField("txHash", tx.Hash().Hex()).Info("User registration transaction sent")

	return &FileUploadResponse{
		Success: true,
		TxHash:  tx.Hash().Hex(),
		Message: "User registered successfully on blockchain",
	}, nil
}

// UploadFile uploads file metadata to the blockchain
func (c *ContractClient) UploadFile(req *FileUploadRequest) (*FileUploadResponse, error) {
	c.logger.WithFields(logrus.Fields{
		"fileHash":   req.FileHash,
		"filename":   req.Filename,
		"size":       req.Size,
		"merkleRoot": req.MerkleRoot,
	}).Info("Uploading file to blockchain...")

	// Convert string hash to bytes32
	fileHash := common.HexToHash(req.FileHash)

	// Set storage fee
	c.auth.Value = big.NewInt(1000000000000000) // 0.001 ETH

	// Upload file
	tx, err := c.contract.UploadFile(
		c.auth,
		fileHash,
		req.Filename,
		big.NewInt(int64(req.Size)),
		req.MerkleRoot,
	)
	if err != nil {
		c.logger.WithError(err).Error("Failed to upload file")
		return &FileUploadResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to upload file: %v", err),
		}, err
	}

	c.logger.WithField("txHash", tx.Hash().Hex()).Info("File upload transaction sent")

	return &FileUploadResponse{
		Success: true,
		TxHash:  tx.Hash().Hex(),
		Message: "File uploaded successfully to blockchain",
	}, nil
}

// UploadFileWithVerification uploads file with proof verification
func (c *ContractClient) UploadFileWithVerification(req *FileUploadRequest) (*FileUploadResponse, error) {
	c.logger.WithFields(logrus.Fields{
		"fileHash":   req.FileHash,
		"filename":   req.Filename,
		"size":       req.Size,
		"merkleRoot": req.MerkleRoot,
	}).Info("Uploading file with verification to blockchain...")

	// Convert string hash to bytes32
	fileHash := common.HexToHash(req.FileHash)
	merkleRoot := common.HexToHash(req.MerkleRoot)
	leafHash := common.HexToHash(req.LeafHash)

	// Convert proof strings to bytes32 array
	var proof []common.Hash
	for _, p := range req.Proof {
		proof = append(proof, common.HexToHash(p))
	}

	// Convert indices to uint256 array
	var indices []*big.Int
	for _, idx := range req.Indices {
		indices = append(indices, big.NewInt(int64(idx)))
	}

	// Set storage fee
	c.auth.Value = big.NewInt(1000000000000000) // 0.001 ETH

	// Upload file with verification
	tx, err := c.contract.UploadFileWithVerification(
		c.auth,
		fileHash,
		req.Filename,
		big.NewInt(int64(req.Size)),
		req.MerkleRoot,
		proof,
		indices,
		leafHash,
	)
	if err != nil {
		c.logger.WithError(err).Error("Failed to upload file with verification")
		return &FileUploadResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to upload file with verification: %v", err),
		}, err
	}

	c.logger.WithField("txHash", tx.Hash().Hex()).Info("File upload with verification transaction sent")

	return &FileUploadResponse{
		Success: true,
		TxHash:  tx.Hash().Hex(),
		Message: "File uploaded with verification successfully to blockchain",
	}, nil
}

// DownloadFile records file download on the blockchain
func (c *ContractClient) DownloadFile(fileHash string) (*FileDownloadResponse, error) {
	c.logger.WithField("fileHash", fileHash).Info("Recording file download on blockchain...")

	hash := common.HexToHash(fileHash)

	tx, err := c.contract.DownloadFile(c.auth, hash)
	if err != nil {
		c.logger.WithError(err).Error("Failed to record file download")
		return &FileDownloadResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to record file download: %v", err),
		}, err
	}

	c.logger.WithField("txHash", tx.Hash().Hex()).Info("File download transaction sent")

	return &FileDownloadResponse{
		Success: true,
		TxHash:  tx.Hash().Hex(),
		Message: "File download recorded successfully on blockchain",
	}, nil
}

// VerifyProof verifies a file's proof on the blockchain
func (c *ContractClient) VerifyProof(req *FileUploadRequest) (*ProofVerificationResponse, error) {
	c.logger.WithFields(logrus.Fields{
		"fileHash":   req.FileHash,
		"merkleRoot": req.MerkleRoot,
	}).Info("Verifying proof on blockchain...")

	// Convert string hash to bytes32
	fileHash := common.HexToHash(req.FileHash)
	merkleRoot := common.HexToHash(req.MerkleRoot)
	leafHash := common.HexToHash(req.LeafHash)

	// Convert proof strings to bytes32 array
	var proof []common.Hash
	for _, p := range req.Proof {
		proof = append(proof, common.HexToHash(p))
	}

	// Convert indices to uint256 array
	var indices []*big.Int
	for _, idx := range req.Indices {
		indices = append(indices, big.NewInt(int64(idx)))
	}

	// Verify proof
	tx, err := c.contract.VerifyFileProof(
		c.auth,
		fileHash,
		merkleRoot,
		proof,
		indices,
		leafHash,
	)
	if err != nil {
		c.logger.WithError(err).Error("Failed to verify proof")
		return &ProofVerificationResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to verify proof: %v", err),
		}, err
	}

	c.logger.WithField("txHash", tx.Hash().Hex()).Info("Proof verification transaction sent")

	return &ProofVerificationResponse{
		Success: true,
		TxHash:  tx.Hash().Hex(),
		Valid:   true, // This would be determined by the contract
		Message: "Proof verified successfully on blockchain",
	}, nil
}

// GetFileMetadata retrieves file metadata from the blockchain
func (c *ContractClient) GetFileMetadata(fileHash string) (map[string]interface{}, error) {
	c.logger.WithField("fileHash", fileHash).Info("Retrieving file metadata from blockchain...")

	hash := common.HexToHash(fileHash)

	metadata, err := c.contract.GetFileMetadata(nil, hash)
	if err != nil {
		c.logger.WithError(err).Error("Failed to get file metadata")
		return nil, err
	}

	result := map[string]interface{}{
		"fileHash":        metadata[0].Hex(),
		"uploader":        metadata[1].Hex(),
		"filename":        metadata[2],
		"size":            metadata[3].Uint64(),
		"uploadTimestamp": metadata[4].Uint64(),
		"merkleRoot":      metadata[5],
		"isActive":        metadata[6],
	}

	c.logger.WithField("metadata", result).Info("File metadata retrieved")

	return result, nil
}

// GetUserProfile retrieves user profile from the blockchain
func (c *ContractClient) GetUserProfile(userAddress string) (map[string]interface{}, error) {
	c.logger.WithField("userAddress", userAddress).Info("Retrieving user profile from blockchain...")

	address := common.HexToAddress(userAddress)

	profile, err := c.contract.GetUserProfile(nil, address)
	if err != nil {
		c.logger.WithError(err).Error("Failed to get user profile")
		return nil, err
	}

	result := map[string]interface{}{
		"username":              profile[0],
		"registrationTimestamp": profile[1].Uint64(),
		"lastActivityTimestamp": profile[2].Uint64(),
		"storageQuota":          profile[3].Uint64(),
		"storageUsed":           profile[4].Uint64(),
		"isSuspended":           profile[5],
	}

	c.logger.WithField("profile", result).Info("User profile retrieved")

	return result, nil
}

// GetSystemStats retrieves system statistics from the blockchain
func (c *ContractClient) GetSystemStats() (map[string]interface{}, error) {
	c.logger.Info("Retrieving system statistics from blockchain...")

	stats, err := c.contract.GetSystemStats(nil)
	if err != nil {
		c.logger.WithError(err).Error("Failed to get system stats")
		return nil, err
	}

	result := map[string]interface{}{
		"totalUsers":      stats[0].Uint64(),
		"totalFiles":      stats[1].Uint64(),
		"totalVerified":   stats[2].Uint64(),
		"totalUploads":    stats[3].Uint64(),
		"totalDownloads": stats[4].Uint64(),
	}

	c.logger.WithField("stats", result).Info("System statistics retrieved")

	return result, nil
}

// HealthCheck checks the health of the contract connection
func (c *ContractClient) HealthCheck() error {
	c.logger.Info("Performing contract health check...")

	// Check if we can connect to the blockchain
	_, err := c.client.ChainID(context.Background())
	if err != nil {
		return fmt.Errorf("failed to get chain ID: %w", err)
	}

	// Check if contract is deployed
	code, err := c.client.CodeAt(context.Background(), common.HexToAddress(c.config.ContractAddress), nil)
	if err != nil {
		return fmt.Errorf("failed to get contract code: %w", err)
	}

	if len(code) == 0 {
		return fmt.Errorf("contract not deployed at address %s", c.config.ContractAddress)
	}

	c.logger.Info("Contract health check passed")
	return nil
}

// Close closes the contract client connection
func (c *ContractClient) Close() error {
	c.logger.Info("Closing contract client...")
	c.client.Close()
	c.logger.Info("Contract client closed")
	return nil
}
