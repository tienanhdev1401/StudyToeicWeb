// src/controllers/uploadController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadRepository } from '../repositories/uploadRepository';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
  }
};

export const uploadController = {
  uploadMiddleware: multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  }).single('image'),

  uploadImage: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // Lấy folderPath từ query params hoặc body
      const folderPath = req.query.folder || req.body.folder;
      
      // Upload với folderPath động
      const imageUrl = await uploadRepository.uploadToCloud(req.file, folderPath as string);
      
      // Xóa file tạm sau khi upload thành công
      try {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.log('Non-critical cleanup error:', cleanupError);
      }
      
      return res.status(200).json({ url: imageUrl });
  
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Đảm bảo xóa file tạm nếu có lỗi trong quá trình upload
      try {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.log('Non-critical cleanup error:', cleanupError);
      }
      
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
};