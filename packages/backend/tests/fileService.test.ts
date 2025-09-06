import { FileService } from '../src/services/fileService';
import { UploadRequest } from '../src/types';

describe('FileService', () => {
  let fileService: FileService;

  beforeEach(() => {
    fileService = new FileService();
  });

  describe('createFileMetadata', () => {
    it('should create file metadata successfully', async () => {
      const request: UploadRequest = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
        isPublic: false,
      };

      const userId = 'test-user-id';
      const result = await fileService.createFileMetadata(request, userId);

      expect(result).toBeDefined();
      expect(result.fileId).toBeDefined();
      expect(result.uploadUrl).toContain('/api/files/');
      expect(result.chunks).toBeInstanceOf(Array);
      expect(result.merkleRoot).toBeDefined();
    });

    it('should handle different file sizes', async () => {
      const request: UploadRequest = {
        filename: 'large-file.zip',
        size: 10485760, // 10MB
        mimeType: 'application/zip',
        isPublic: true,
      };

      const userId = 'test-user-id';
      const result = await fileService.createFileMetadata(request, userId);

      expect(result).toBeDefined();
      expect(result.chunks.length).toBeGreaterThan(0);
    });
  });

  describe('getFileMetadata', () => {
    it('should return null for non-existent file', async () => {
      const result = await fileService.getFileMetadata('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return file metadata for existing file', async () => {
      // First create a file
      const request: UploadRequest = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
        isPublic: false,
      };

      const userId = 'test-user-id';
      const uploadResult = await fileService.createFileMetadata(request, userId);
      
      // Then retrieve it
      const result = await fileService.getFileMetadata(uploadResult.fileId);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(uploadResult.fileId);
      expect(result?.filename).toBe('test.txt');
      expect(result?.size).toBe(1024);
      expect(result?.mimeType).toBe('text/plain');
    });
  });

  describe('getUserFiles', () => {
    it('should return empty array for user with no files', async () => {
      const result = await fileService.getUserFiles('user-with-no-files');
      expect(result.files).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return user files with pagination', async () => {
      const userId = 'test-user-id';
      
      // Create multiple files
      for (let i = 0; i < 5; i++) {
        const request: UploadRequest = {
          filename: `test-${i}.txt`,
          size: 1024,
          mimeType: 'text/plain',
          isPublic: false,
        };
        await fileService.createFileMetadata(request, userId);
      }

      const result = await fileService.getUserFiles(userId, 1, 3);
      
      expect(result.files.length).toBe(3);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
    });
  });

  describe('incrementDownloadCount', () => {
    it('should increment download count', async () => {
      // Create a file first
      const request: UploadRequest = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
        isPublic: false,
      };

      const userId = 'test-user-id';
      const uploadResult = await fileService.createFileMetadata(request, userId);
      
      // Get initial metadata
      const initialMetadata = await fileService.getFileMetadata(uploadResult.fileId);
      const initialCount = initialMetadata?.downloadCount || 0;
      
      // Increment download count
      await fileService.incrementDownloadCount(uploadResult.fileId);
      
      // Get updated metadata
      const updatedMetadata = await fileService.getFileMetadata(uploadResult.fileId);
      
      expect(updatedMetadata?.downloadCount).toBe(initialCount + 1);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      // Create a file first
      const request: UploadRequest = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
        isPublic: false,
      };

      const userId = 'test-user-id';
      const uploadResult = await fileService.createFileMetadata(request, userId);
      
      // Delete the file
      const result = await fileService.deleteFile(uploadResult.fileId, userId);
      
      expect(result).toBe(true);
      
      // Verify file is deleted
      const metadata = await fileService.getFileMetadata(uploadResult.fileId);
      expect(metadata).toBeNull();
    });

    it('should return false for non-existent file', async () => {
      const result = await fileService.deleteFile('non-existent-id', 'test-user-id');
      expect(result).toBe(false);
    });

    it('should return false for unauthorized user', async () => {
      // Create a file first
      const request: UploadRequest = {
        filename: 'test.txt',
        size: 1024,
        mimeType: 'text/plain',
        isPublic: false,
      };

      const userId = 'test-user-id';
      const uploadResult = await fileService.createFileMetadata(request, userId);
      
      // Try to delete with different user
      const result = await fileService.deleteFile(uploadResult.fileId, 'different-user-id');
      
      expect(result).toBe(false);
    });
  });
});
