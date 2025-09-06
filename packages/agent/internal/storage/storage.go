package storage

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/pkg/errors"
)

type FileChunk struct {
	ID       string `json:"id"`
	Index    int    `json:"index"`
	Data     []byte `json:"data"`
	Hash     string `json:"hash"`
	Size     int64  `json:"size"`
	ParentID string `json:"parent_id"`
}

type FileMetadata struct {
	ID         string       `json:"id"`
	Filename   string       `json:"filename"`
	Size       int64        `json:"size"`
	MimeType   string       `json:"mime_type"`
	Hash       string       `json:"hash"`
	MerkleRoot string       `json:"merkle_root"`
	Chunks     []FileChunk  `json:"chunks"`
	UploadedAt string       `json:"uploaded_at"`
	UserID     string       `json:"user_id"`
	IsPublic   bool         `json:"is_public"`
}

type StorageManager struct {
	dataDir   string
	tempDir   string
	chunkSize int
}

func NewStorageManager(dataDir, tempDir string, chunkSize int) *StorageManager {
	return &StorageManager{
		dataDir:   dataDir,
		tempDir:   tempDir,
		chunkSize: chunkSize,
	}
}

func (sm *StorageManager) ChunkFile(filePath string) (*FileMetadata, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, errors.Wrap(err, "failed to open file")
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return nil, errors.Wrap(err, "failed to get file info")
	}

	fileID := uuid.New().String()
	var chunks []FileChunk
	var chunkHashes []string

	// Read file in chunks
	buffer := make([]byte, sm.chunkSize)
	chunkIndex := 0

	for {
		n, err := file.Read(buffer)
		if err != nil && err != io.EOF {
			return nil, errors.Wrap(err, "failed to read file chunk")
		}

		if n == 0 {
			break
		}

		// Create chunk
		chunkData := make([]byte, n)
		copy(chunkData, buffer[:n])

		chunkHash := sm.calculateHash(chunkData)
		chunkHashes = append(chunkHashes, chunkHash)

		chunk := FileChunk{
			ID:       fmt.Sprintf("%s_chunk_%d", fileID, chunkIndex),
			Index:    chunkIndex,
			Data:     chunkData,
			Hash:     chunkHash,
			Size:     int64(n),
			ParentID: fileID,
		}

		chunks = append(chunks, chunk)
		chunkIndex++

		if err == io.EOF {
			break
		}
	}

	// Calculate Merkle root
	merkleRoot := sm.calculateMerkleRoot(chunkHashes)

	// Calculate file hash
	fileHash := sm.calculateFileHash(filePath)

	metadata := &FileMetadata{
		ID:         fileID,
		Filename:   filepath.Base(filePath),
		Size:       fileInfo.Size(),
		MimeType:   sm.detectMimeType(filePath),
		Hash:       fileHash,
		MerkleRoot: merkleRoot,
		Chunks:     chunks,
		UploadedAt: fileInfo.ModTime().Format("2006-01-02T15:04:05Z"),
		UserID:     "anonymous", // This would come from authentication
		IsPublic:   false,
	}

	return metadata, nil
}

func (sm *StorageManager) calculateHash(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

func (sm *StorageManager) calculateFileHash(filePath string) string {
	file, err := os.Open(filePath)
	if err != nil {
		return ""
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return ""
	}

	return hex.EncodeToString(hasher.Sum(nil))
}

func (sm *StorageManager) calculateMerkleRoot(hashes []string) string {
	if len(hashes) == 0 {
		return ""
	}

	if len(hashes) == 1 {
		return hashes[0]
	}

	var nextLevel []string
	for i := 0; i < len(hashes); i += 2 {
		if i+1 < len(hashes) {
			combined := hashes[i] + hashes[i+1]
			hash := sha256.Sum256([]byte(combined))
			nextLevel = append(nextLevel, hex.EncodeToString(hash[:]))
		} else {
			nextLevel = append(nextLevel, hashes[i])
		}
	}

	return sm.calculateMerkleRoot(nextLevel)
}

func (sm *StorageManager) detectMimeType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	
	mimeTypes := map[string]string{
		".txt":  "text/plain",
		".pdf":  "application/pdf",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".mp4":  "video/mp4",
		".mp3":  "audio/mpeg",
		".zip":  "application/zip",
		".json": "application/json",
		".xml":  "application/xml",
		".html": "text/html",
		".css":  "text/css",
		".js":   "application/javascript",
	}

	if mimeType, exists := mimeTypes[ext]; exists {
		return mimeType
	}

	return "application/octet-stream"
}

func (sm *StorageManager) SaveChunk(chunk *FileChunk) error {
	chunkPath := filepath.Join(sm.dataDir, "chunks", chunk.ID)
	
	if err := os.MkdirAll(filepath.Dir(chunkPath), 0755); err != nil {
		return errors.Wrap(err, "failed to create chunk directory")
	}

	if err := os.WriteFile(chunkPath, chunk.Data, 0644); err != nil {
		return errors.Wrap(err, "failed to save chunk")
	}

	return nil
}

func (sm *StorageManager) LoadChunk(chunkID string) (*FileChunk, error) {
	chunkPath := filepath.Join(sm.dataDir, "chunks", chunkID)
	
	data, err := os.ReadFile(chunkPath)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read chunk")
	}

	chunk := &FileChunk{
		ID:   chunkID,
		Data: data,
		Size: int64(len(data)),
		Hash: sm.calculateHash(data),
	}

	return chunk, nil
}

func (sm *StorageManager) ReconstructFile(metadata *FileMetadata, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return errors.Wrap(err, "failed to create output file")
	}
	defer file.Close()

	// Sort chunks by index
	for _, chunk := range metadata.Chunks {
		if _, err := file.Write(chunk.Data); err != nil {
			return errors.Wrap(err, "failed to write chunk to file")
		}
	}

	return nil
}

func (sm *StorageManager) VerifyFileIntegrity(metadata *FileMetadata) bool {
	// Verify Merkle root
	var chunkHashes []string
	for _, chunk := range metadata.Chunks {
		chunkHashes = append(chunkHashes, chunk.Hash)
	}

	calculatedMerkleRoot := sm.calculateMerkleRoot(chunkHashes)
	return calculatedMerkleRoot == metadata.MerkleRoot
}
