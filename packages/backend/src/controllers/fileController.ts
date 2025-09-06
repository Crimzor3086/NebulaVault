import { Request, Response } from 'express';
import { FileService } from '../services/fileService';
import { ApiResponse, UploadRequest, FileListResponse } from '../types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const fileService = new FileService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, but you can add restrictions here
    cb(null, true);
  }
});

export class FileController {
  // Initialize file upload
  async initializeUpload(req: Request, res: Response): Promise<void> {
    try {
      const { filename, size, mimeType, isPublic } = req.body as UploadRequest;
      const userId = (req as any).user?.id || 'anonymous';

      if (!filename || !size || !mimeType) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: filename, size, mimeType'
        } as ApiResponse);
        return;
      }

      const uploadResponse = await fileService.createFileMetadata(
        { filename, size, mimeType, isPublic },
        userId
      );

      res.json({
        success: true,
        data: uploadResponse,
        message: 'Upload initialized successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error initializing upload:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize upload'
      } as ApiResponse);
    }
  }

  // Handle file upload
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const userId = (req as any).user?.id || 'anonymous';

      // Verify file exists in database
      const fileMetadata = await fileService.getFileMetadata(fileId);
      if (!fileMetadata) {
        res.status(404).json({
          success: false,
          error: 'File not found'
        } as ApiResponse);
        return;
      }

      if (fileMetadata.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        } as ApiResponse);
        return;
      }

      // In a real implementation, this would integrate with 0G Storage
      // For now, we'll just simulate the upload process
      res.json({
        success: true,
        data: {
          fileId,
          message: 'File uploaded successfully to 0G Storage',
          merkleRoot: fileMetadata.merkleRoot,
          chunks: fileMetadata.chunks
        },
        message: 'File uploaded successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file'
      } as ApiResponse);
    }
  }

  // Get file metadata
  async getFileMetadata(req: Request, res: Response): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const userId = (req as any).user?.id;

      const fileMetadata = await fileService.getFileMetadata(fileId);
      if (!fileMetadata) {
        res.status(404).json({
          success: false,
          error: 'File not found'
        } as ApiResponse);
        return;
      }

      // Check if user has access to the file
      if (!fileMetadata.isPublic && fileMetadata.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: fileMetadata,
        message: 'File metadata retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get file metadata'
      } as ApiResponse);
    }
  }

  // Download file
  async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const userId = (req as any).user?.id;

      const fileMetadata = await fileService.getFileMetadata(fileId);
      if (!fileMetadata) {
        res.status(404).json({
          success: false,
          error: 'File not found'
        } as ApiResponse);
        return;
      }

      // Check if user has access to the file
      if (!fileMetadata.isPublic && fileMetadata.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied'
        } as ApiResponse);
        return;
      }

      // Increment download count
      await fileService.incrementDownloadCount(fileId);

      // In a real implementation, this would retrieve the file from 0G Storage
      res.json({
        success: true,
        data: {
          fileId,
          filename: fileMetadata.originalName,
          size: fileMetadata.size,
          mimeType: fileMetadata.mimeType,
          downloadUrl: `/api/files/${fileId}/download`,
          merkleRoot: fileMetadata.merkleRoot,
          chunks: fileMetadata.chunks
        },
        message: 'File download initiated'
      } as ApiResponse);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download file'
      } as ApiResponse);
    }
  }

  // Get user's files
  async getUserFiles(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const result = await fileService.getUserFiles(userId, page, limit);
      const totalPages = Math.ceil(result.total / limit);

      const response: FileListResponse = {
        files: result.files,
        total: result.total,
        page,
        limit,
        totalPages
      };

      res.json({
        success: true,
        data: response,
        message: 'Files retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting user files:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user files'
      } as ApiResponse);
    }
  }

  // Delete file
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const fileId = req.params.fileId;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const deleted = await fileService.deleteFile(fileId, userId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'File not found or access denied'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete file'
      } as ApiResponse);
    }
  }
}

export { upload };
