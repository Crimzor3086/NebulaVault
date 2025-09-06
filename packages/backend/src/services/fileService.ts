import { db } from '../config/database';
import { FileMetadata, UploadRequest, UploadResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export class FileService {
  private uploadDir: string;
  private tempDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.tempDir = process.env.TEMP_DIR || './temp';
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.uploadDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async createFileMetadata(request: UploadRequest, userId: string): Promise<UploadResponse> {
    const fileId = uuidv4();
    const hash = crypto.randomBytes(32).toString('hex');
    const merkleRoot = crypto.randomBytes(32).toString('hex');
    
    // Generate chunk IDs (simplified - in real implementation, this would be based on actual file chunking)
    const chunks = Array.from({ length: Math.ceil(request.size / 1024) }, (_, i) => 
      `${fileId}_chunk_${i}`
    );

    const fileMetadata: FileMetadata = {
      id: fileId,
      filename: `${fileId}_${request.filename}`,
      originalName: request.filename,
      size: request.size,
      mimeType: request.mimeType,
      hash,
      merkleRoot,
      chunks,
      uploadedAt: new Date(),
      userId,
      isPublic: request.isPublic || false,
      downloadCount: 0
    };

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO files (id, filename, original_name, size, mime_type, hash, merkle_root, chunks, user_id, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fileMetadata.id,
          fileMetadata.filename,
          fileMetadata.originalName,
          fileMetadata.size,
          fileMetadata.mimeType,
          fileMetadata.hash,
          fileMetadata.merkleRoot,
          JSON.stringify(fileMetadata.chunks),
          fileMetadata.userId,
          fileMetadata.isPublic ? 1 : 0
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              fileId,
              uploadUrl: `/api/files/${fileId}/upload`,
              chunks,
              merkleRoot
            });
          }
        }
      );
    });
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM files WHERE id = ?',
        [fileId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              filename: row.filename,
              originalName: row.original_name,
              size: row.size,
              mimeType: row.mime_type,
              hash: row.hash,
              merkleRoot: row.merkle_root,
              chunks: JSON.parse(row.chunks),
              uploadedAt: new Date(row.uploaded_at),
              userId: row.user_id,
              isPublic: Boolean(row.is_public),
              downloadCount: row.download_count
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getUserFiles(userId: string, page: number = 1, limit: number = 10): Promise<{ files: FileMetadata[], total: number }> {
    const offset = (page - 1) * limit;

    return new Promise((resolve, reject) => {
      // Get total count
      db.get(
        'SELECT COUNT(*) as total FROM files WHERE user_id = ?',
        [userId],
        (err, countRow: any) => {
          if (err) {
            reject(err);
            return;
          }

          // Get files
          db.all(
            'SELECT * FROM files WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT ? OFFSET ?',
            [userId, limit, offset],
            (err, rows: any[]) => {
              if (err) {
                reject(err);
              } else {
                const files = rows.map(row => ({
                  id: row.id,
                  filename: row.filename,
                  originalName: row.original_name,
                  size: row.size,
                  mimeType: row.mime_type,
                  hash: row.hash,
                  merkleRoot: row.merkle_root,
                  chunks: JSON.parse(row.chunks),
                  uploadedAt: new Date(row.uploaded_at),
                  userId: row.user_id,
                  isPublic: Boolean(row.is_public),
                  downloadCount: row.download_count
                }));

                resolve({
                  files,
                  total: countRow.total
                });
              }
            }
          );
        }
      );
    });
  }

  async incrementDownloadCount(fileId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE files SET download_count = download_count + 1 WHERE id = ?',
        [fileId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM files WHERE id = ? AND user_id = ?',
        [fileId, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }
}
