import { Request, Response } from 'express';
import { BlogRepository } from '../../repositories/admin/admin.blogRepository';

export class BlogController {
  /**
   * Lấy tất cả blogs
   */
  static async getAllBlogs(req: Request, res: Response) {
    try {
      const blogs = await BlogRepository.getAllBlogs();
  
      res.status(200).json({
        success: true,
        data: blogs,
        message: 'Lấy danh sách blog thành công'
      });

    } catch (error) {
      console.error('Lỗi khi lấy danh sách blog:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách blog'
      });
    }
  }

  /**
   * Lấy thông tin blog theo ID
   */
  static async findBlogById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const blog = await BlogRepository.findById(id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy blog'
        });
      }
  
      res.status(200).json({
        success: true,
        data: blog,
        message: 'Lấy thông tin blog thành công'
      });
  
    } catch (error) {
      console.error('Lỗi khi lấy thông tin blog:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy thông tin blog'
      });
    }
  }

  /**
   * Thêm mới blog
   */
  static async addBlog(req: Request, res: Response) {
    try {
      const { title, content, imageUrl, author } = req.body;
      
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề blog không được để trống'
        });
      }
      
      const createdBlog = await BlogRepository.addBlog(title, content, imageUrl, author);

      res.status(201).json({
        success: true,
        message: 'Tạo blog thành công',
        data: createdBlog
      });
    } catch (error) {
      console.error('Lỗi khi tạo blog:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi tạo blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cập nhật blog
   */
  static async updateBlog(req: Request, res: Response) {
    try {
      const blogId = parseInt(req.params.id);
      const { title, content, imageUrl } = req.body;
      
      const existingBlog = await BlogRepository.findById(blogId);
      if (!existingBlog) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy blog',
        });
      }

      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề blog không được để trống'
        });
      }
      
      const updatedBlog = await BlogRepository.updateBlog(blogId, title, content, imageUrl);

      res.status(200).json({
        success: true,
        message: 'Cập nhật blog thành công',
        data: updatedBlog
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật blog:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi cập nhật blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Xóa blog
   */
  static async deleteBlog(req: Request, res: Response) {
    try {
      const blogId = parseInt(req.params.id);
      
      const existingBlog = await BlogRepository.findById(blogId);
      if (!existingBlog) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy blog',
        });
      }

      await BlogRepository.deleteBlog(blogId);

      res.status(200).json({
        success: true,
        message: 'Xóa blog thành công',
      });
    } catch (error) {
      console.error('Lỗi khi xóa blog:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xóa blog',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new BlogController();