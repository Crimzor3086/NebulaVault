export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  hash: string;
  merkleRoot: string;
  chunks: string[];
  uploadedAt: Date;
  userId: string;
  isPublic: boolean;
  downloadCount: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  isActive: boolean;
}

export interface UploadRequest {
  filename: string;
  size: number;
  mimeType: string;
  isPublic?: boolean;
}

export interface UploadResponse {
  fileId: string;
  uploadUrl: string;
  chunks: string[];
  merkleRoot: string;
}

export interface DownloadRequest {
  fileId: string;
  userId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FileListResponse {
  files: FileMetadata[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
