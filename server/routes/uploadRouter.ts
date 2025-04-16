// src/routes/uploadRouter.ts
import express from 'express';
import { uploadController } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/image', 
    authenticate,
    uploadController.uploadMiddleware,
    uploadController.uploadImage
);

export default router;