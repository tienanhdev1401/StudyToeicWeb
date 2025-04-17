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
// Interface cho upload configuration
interface UploadConfig {
  path: string;
  options?: {
    resourceType?: string;
    tags?: string[];
    transformation?: any;
  };
}
//Dùng cho Api của Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


export class UploadRepository {
  private readonly basePath: string = 'toeic_web';

  //Xóa ảnh theo id
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }
  getPublicIdFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      // Phân tích URL để lấy public_id
      // URL Cloudinary có định dạng: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/image_id.jpg
      const urlParts = url.split('/');
      const filenameWithExtension = urlParts[urlParts.length - 1];
      const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
      
      if (versionIndex === -1) return null;
      
      // Lấy phần path sau phần version (v1234567890)
      const pathParts = urlParts.slice(versionIndex + 1);
      const filename = filenameWithExtension.split('.')[0]; // Loại bỏ phần mở rộng
      
      // Ghép lại thành public_id đầy đủ
      return pathParts.join('/').replace('/' + filenameWithExtension, '/' + filename);
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }

  // Hàm xóa ảnh theo URL
  async deleteImageByUrl(url: string): Promise<boolean> {
    const publicId = this.getPublicIdFromUrl(url);
    if (!publicId) return false;

    return this.deleteImage(publicId);
  }

  async uploadToCloud(file: Express.Multer.File, folderPath?: string): Promise<string> {
    try {
      const uploadPath = folderPath
        ? `${this.basePath}/${folderPath}`
        : this.basePath;

      const result = await cloudinary.uploader.upload(file.path, {
        folder: uploadPath,
        resource_type: 'auto'
      });

      return result.secure_url;

    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error(error.message || 'Image upload failed');
    } 
  }
}

export const uploadRepository = new UploadRepository();