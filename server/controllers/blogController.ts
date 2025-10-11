import { Request, Response } from 'express';
import { PublicBlogRepository } from '../repositories/blogRepository';

export class BlogController {
  static async list(req: Request, res: Response) {
    try {
      const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 9, 1), 50);
      const search = (req.query.search as string) || undefined;
      const author = (req.query.author as string) || undefined;
      const orderBy = (req.query.orderBy as 'createdAt' | 'updatedAt' | 'title') || 'createdAt';
      const orderDirection = (req.query.orderDirection as 'asc' | 'desc') || 'desc';

      const offset = (page - 1) * limit;

      const { data, total } = await PublicBlogRepository.findAndCount({
        search,
        author,
        orderBy,
        orderDirection,
        limit,
        offset,
      });

      return res.status(200).json({
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
        },
        message: 'Lấy danh sách blog thành công',
      });
    } catch (error) {
      console.error('BlogController.list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách blog',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID blog không hợp lệ',
        });
      }

      const blog = await PublicBlogRepository.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy blog',
        });
      }

      return res.status(200).json({
        success: true,
        data: blog,
        message: 'Lấy thông tin blog thành công',
      });
    } catch (error) {
      console.error('BlogController.getById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy thông tin blog',
      });
    }
  }
}
