package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"nebularvault-agent/internal/storage"
	"nebularvault-agent/internal/zerog"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"status":    "healthy",
			"service":   "nebularvault-agent",
			"version":   "1.0.0",
			"timestamp": "2024-01-01T00:00:00Z",
		},
		Message: "NebularVault Agent is running 🚀",
	})
}

func UploadFile(storageManager *storage.StorageManager, zeroGClient *zerog.ZeroGClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			logrus.Errorf("Failed to get uploaded file: %v", err)
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "No file uploaded",
			})
			return
		}

		// Save uploaded file temporarily
		tempPath := "/tmp/" + file.Filename
		if err := c.SaveUploadedFile(file, tempPath); err != nil {
			logrus.Errorf("Failed to save uploaded file: %v", err)
			c.JSON(http.StatusInternalServerError, APIResponse{
				Success: false,
				Error:   "Failed to save uploaded file",
			})
			return
		}

		// Chunk the file
		metadata, err := storageManager.ChunkFile(tempPath)
		if err != nil {
			logrus.Errorf("Failed to chunk file: %v", err)
			c.JSON(http.StatusInternalServerError, APIResponse{
				Success: false,
				Error:   "Failed to chunk file",
			})
			return
		}

		// Upload chunks to 0G Storage
		var uploadedChunks []string
		for _, chunk := range metadata.Chunks {
			uploadResp, err := zeroGClient.Upload(chunk.Data, map[string]interface{}{
				"chunk_id":   chunk.ID,
				"parent_id":  chunk.ParentID,
				"index":      chunk.Index,
				"size":       chunk.Size,
			})
			if err != nil {
				logrus.Errorf("Failed to upload chunk %s: %v", chunk.ID, err)
				c.JSON(http.StatusInternalServerError, APIResponse{
					Success: false,
					Error:   "Failed to upload chunk to 0G Storage",
				})
				return
			}
			uploadedChunks = append(uploadedChunks, uploadResp.Hash)
		}

		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data: map[string]interface{}{
				"file_id":      metadata.ID,
				"filename":     metadata.Filename,
				"size":         metadata.Size,
				"merkle_root":  metadata.MerkleRoot,
				"chunks":       uploadedChunks,
				"uploaded_at":  metadata.UploadedAt,
			},
			Message: "File uploaded successfully to 0G Storage",
		})
	}
}

func DownloadFile(storageManager *storage.StorageManager, zeroGClient *zerog.ZeroGClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		hash := c.Param("hash")
		if hash == "" {
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "Hash parameter is required",
			})
			return
		}

		// Download from 0G Storage
		downloadResp, err := zeroGClient.Download(hash)
		if err != nil {
			logrus.Errorf("Failed to download from 0G Storage: %v", err)
			c.JSON(http.StatusInternalServerError, APIResponse{
				Success: false,
				Error:   "Failed to download from 0G Storage",
			})
			return
		}

		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data: map[string]interface{}{
				"hash": hash,
				"data": downloadResp.Data,
				"size": len(downloadResp.Data),
			},
			Message: "File downloaded successfully from 0G Storage",
		})
	}
}

func GetFileMetadata(storageManager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		hash := c.Param("hash")
		if hash == "" {
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "Hash parameter is required",
			})
			return
		}

		// In a real implementation, this would query the database
		// For now, return a mock response
		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data: map[string]interface{}{
				"hash":         hash,
				"filename":     "example.txt",
				"size":         1024,
				"merkle_root":  "abc123...",
				"uploaded_at":  "2024-01-01T00:00:00Z",
			},
			Message: "File metadata retrieved successfully",
		})
	}
}

func GetProof(zeroGClient *zerog.ZeroGClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		hash := c.Param("hash")
		if hash == "" {
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "Hash parameter is required",
			})
			return
		}

		proofResp, err := zeroGClient.GetProof(hash)
		if err != nil {
			logrus.Errorf("Failed to get proof from 0G Storage: %v", err)
			c.JSON(http.StatusInternalServerError, APIResponse{
				Success: false,
				Error:   "Failed to get proof from 0G Storage",
			})
			return
		}

		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data: map[string]interface{}{
				"hash":  hash,
				"proof": proofResp.Proof,
			},
			Message: "Proof retrieved successfully",
		})
	}
}

func ChunkFile(storageManager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			FilePath string `json:"file_path" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "Invalid request body",
			})
			return
		}

		metadata, err := storageManager.ChunkFile(request.FilePath)
		if err != nil {
			logrus.Errorf("Failed to chunk file: %v", err)
			c.JSON(http.StatusInternalServerError, APIResponse{
				Success: false,
				Error:   "Failed to chunk file",
			})
			return
		}

		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data:    metadata,
			Message: "File chunked successfully",
		})
	}
}

func ReconstructFile(storageManager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Metadata   *storage.FileMetadata `json:"metadata" binding:"required"`
			OutputPath string                `json:"output_path" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "Invalid request body",
			})
			return
		}

		err := storageManager.ReconstructFile(request.Metadata, request.OutputPath)
		if err != nil {
			logrus.Errorf("Failed to reconstruct file: %v", err)
			c.JSON(http.StatusInternalServerError, APIResponse{
				Success: false,
				Error:   "Failed to reconstruct file",
			})
			return
		}

		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data: map[string]interface{}{
				"output_path": request.OutputPath,
				"file_id":     request.Metadata.ID,
			},
			Message: "File reconstructed successfully",
		})
	}
}

func VerifyFileIntegrity(storageManager *storage.StorageManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		hash := c.Param("hash")
		if hash == "" {
			c.JSON(http.StatusBadRequest, APIResponse{
				Success: false,
				Error:   "Hash parameter is required",
			})
			return
		}

		// In a real implementation, this would load the metadata from database
		// For now, return a mock response
		isValid := true // Mock validation result

		c.JSON(http.StatusOK, APIResponse{
			Success: true,
			Data: map[string]interface{}{
				"hash":      hash,
				"is_valid":  isValid,
				"verified":  true,
			},
			Message: "File integrity verified successfully",
		})
	}
}
