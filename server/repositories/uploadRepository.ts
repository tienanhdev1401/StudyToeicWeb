// src/repositories/uploadRepository.ts
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';




//Dùng cho Api của ImgBB
// export const uploadRepository = {
//   uploadToImgBB: async (file: Express.Multer.File): Promise<string> => {
//     try {
//       const fileData = fs.readFileSync(file.path);
//       const formData = new FormData();
//       formData.append('image', fileData, file.originalname);
      
//       const response = await axios.post(
//         'https://api.imgbb.com/1/upload',
//         formData,
//         {
//           params: {
//             key: process.env.IMGBB_API_KEY
//           },
//           headers: formData.getHeaders()
//         }
//       );

//       if (response.data.success) {
//         return response.data.data.url;
//       }
//       throw new Error('ImgBB upload failed');

//     } catch (error: any) {
//       console.error('ImgBB upload error:', error);
//       throw new Error(error.response?.data?.error?.message || 'Image upload failed');
//     }
//   }
// };

//Dùng cho Api của Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadRepository = {
  uploadToCloud: async (file: Express.Multer.File): Promise<string> => {
    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'toeic_web', // Optional: organize uploads in folders
        resource_type: 'auto'
      });

      // Return the secure URL
      return result.secure_url;

    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error(error.message || 'Image upload failed');
    } finally {
      // Clean up the temporary file
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }
  }
};