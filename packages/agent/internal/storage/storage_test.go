package storage

import (
	"os"
	"path/filepath"
	"testing"
)

func TestStorageManager_ChunkFile(t *testing.T) {
	// Create a temporary test file
	tempDir := t.TempDir()
	testFile := filepath.Join(tempDir, "test.txt")
	
	// Write test content
	testContent := "This is a test file content for chunking."
	err := os.WriteFile(testFile, []byte(testContent), 0644)
	if err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// Create storage manager
	storageManager := NewStorageManager(tempDir, tempDir, 10) // 10 byte chunks

	// Test chunking
	metadata, err := storageManager.ChunkFile(testFile)
	if err != nil {
		t.Fatalf("Failed to chunk file: %v", err)
	}

	// Verify metadata
	if metadata.ID == "" {
		t.Error("Expected file ID to be set")
	}
	if metadata.Filename != "test.txt" {
		t.Errorf("Expected filename 'test.txt', got '%s'", metadata.Filename)
	}
	if metadata.Size != int64(len(testContent)) {
		t.Errorf("Expected size %d, got %d", len(testContent), metadata.Size)
	}
	if metadata.MimeType != "text/plain" {
		t.Errorf("Expected mime type 'text/plain', got '%s'", metadata.MimeType)
	}
	if metadata.Hash == "" {
		t.Error("Expected file hash to be set")
	}
	if metadata.MerkleRoot == "" {
		t.Error("Expected Merkle root to be set")
	}
	if len(metadata.Chunks) == 0 {
		t.Error("Expected chunks to be created")
	}

	// Verify chunk count
	expectedChunks := (len(testContent) + 9) / 10 // Ceiling division
	if len(metadata.Chunks) != expectedChunks {
		t.Errorf("Expected %d chunks, got %d", expectedChunks, len(metadata.Chunks))
	}
}

func TestStorageManager_ReconstructFile(t *testing.T) {
	// Create a temporary test file
	tempDir := t.TempDir()
	testFile := filepath.Join(tempDir, "test.txt")
	
	// Write test content
	testContent := "This is a test file content for reconstruction."
	err := os.WriteFile(testFile, []byte(testContent), 0644)
	if err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// Create storage manager
	storageManager := NewStorageManager(tempDir, tempDir, 10) // 10 byte chunks

	// Chunk the file
	metadata, err := storageManager.ChunkFile(testFile)
	if err != nil {
		t.Fatalf("Failed to chunk file: %v", err)
	}

	// Reconstruct the file
	outputFile := filepath.Join(tempDir, "reconstructed.txt")
	err = storageManager.ReconstructFile(metadata, outputFile)
	if err != nil {
		t.Fatalf("Failed to reconstruct file: %v", err)
	}

	// Verify reconstructed content
	reconstructedContent, err := os.ReadFile(outputFile)
	if err != nil {
		t.Fatalf("Failed to read reconstructed file: %v", err)
	}

	if string(reconstructedContent) != testContent {
		t.Errorf("Reconstructed content doesn't match original")
	}
}

func TestStorageManager_VerifyFileIntegrity(t *testing.T) {
	// Create a temporary test file
	tempDir := t.TempDir()
	testFile := filepath.Join(tempDir, "test.txt")
	
	// Write test content
	testContent := "This is a test file for integrity verification."
	err := os.WriteFile(testFile, []byte(testContent), 0644)
	if err != nil {
		t.Fatalf("Failed to create test file: %v", err)
	}

	// Create storage manager
	storageManager := NewStorageManager(tempDir, tempDir, 10)

	// Chunk the file
	metadata, err := storageManager.ChunkFile(testFile)
	if err != nil {
		t.Fatalf("Failed to chunk file: %v", err)
	}

	// Verify integrity
	isValid := storageManager.VerifyFileIntegrity(metadata)
	if !isValid {
		t.Error("Expected file integrity verification to pass")
	}
}

func TestStorageManager_DetectMimeType(t *testing.T) {
	storageManager := NewStorageManager("", "", 1024)

	tests := []struct {
		filename string
		expected string
	}{
		{"test.txt", "text/plain"},
		{"document.pdf", "application/pdf"},
		{"image.jpg", "image/jpeg"},
		{"image.png", "image/png"},
		{"video.mp4", "video/mp4"},
		{"audio.mp3", "audio/mpeg"},
		{"archive.zip", "application/zip"},
		{"unknown.xyz", "application/octet-stream"},
	}

	for _, test := range tests {
		result := storageManager.detectMimeType(test.filename)
		if result != test.expected {
			t.Errorf("For file '%s', expected '%s', got '%s'", test.filename, test.expected, result)
		}
	}
}

func TestStorageManager_CalculateHash(t *testing.T) {
	storageManager := NewStorageManager("", "", 1024)

	testData := []byte("test data")
	hash1 := storageManager.calculateHash(testData)
	hash2 := storageManager.calculateHash(testData)

	if hash1 != hash2 {
		t.Error("Hash calculation should be deterministic")
	}

	if len(hash1) != 64 { // SHA256 hex length
		t.Errorf("Expected hash length 64, got %d", len(hash1))
	}
}

func TestStorageManager_CalculateMerkleRoot(t *testing.T) {
	storageManager := NewStorageManager("", "", 1024)

	// Test with single hash
	hashes1 := []string{"abc123"}
	root1 := storageManager.calculateMerkleRoot(hashes1)
	if root1 != "abc123" {
		t.Error("Single hash should return itself as Merkle root")
	}

	// Test with multiple hashes
	hashes2 := []string{"hash1", "hash2", "hash3", "hash4"}
	root2 := storageManager.calculateMerkleRoot(hashes2)
	if root2 == "" {
		t.Error("Merkle root should not be empty")
	}

	// Test with odd number of hashes
	hashes3 := []string{"hash1", "hash2", "hash3"}
	root3 := storageManager.calculateMerkleRoot(hashes3)
	if root3 == "" {
		t.Error("Merkle root should not be empty for odd number of hashes")
	}
}
