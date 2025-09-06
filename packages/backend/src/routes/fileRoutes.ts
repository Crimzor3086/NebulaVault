import { Router } from 'express';
import { FileController, upload } from '../controllers/fileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const fileController = new FileController();

// Public routes
router.get('/:fileId/metadata', fileController.getFileMetadata.bind(fileController));
router.get('/:fileId/download', fileController.downloadFile.bind(fileController));

// Protected routes (require authentication)
router.post('/initialize', authenticateToken, fileController.initializeUpload.bind(fileController));
router.post('/:fileId/upload', authenticateToken, upload.single('file'), fileController.uploadFile.bind(fileController));
router.get('/user/files', authenticateToken, fileController.getUserFiles.bind(fileController));
router.delete('/:fileId', authenticateToken, fileController.deleteFile.bind(fileController));

export default router;
