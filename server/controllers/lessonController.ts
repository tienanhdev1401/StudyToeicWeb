import { Request, Response } from 'express';
import { LessonRepository } from '../repositories/lessonRepository';

export class LessonController {
  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 12, 50);
      const offset = (page - 1) * limit;

      const status = (req.query.status as string) || 'published';
      const topic = req.query.topic as string | undefined;
      const search = req.query.search as string | undefined;
      const includeCaptions = (req.query.includeCaptions as string) === 'true';

      const lessons = await LessonRepository.findAll({
        status,
        topic,
        search,
        limit,
        offset,
        includeCaptions,
        orderBy: (req.query.orderBy as any) || 'created_at',
        orderDirection: (req.query.orderDirection as any) || 'desc',
      });

      return res.status(200).json({
        success: true,
        data: lessons,
        meta: {
          page,
          limit,
          count: lessons.length,
        },
        message: 'Lấy danh sách bài học thành công',
      });
    } catch (error) {
      console.error('LessonController.list error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách bài học',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài học không hợp lệ',
        });
      }

      const lesson = await LessonRepository.findById(id, { includeCaptions: true });

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài học',
        });
      }

      if (lesson.status !== 'published') {
        return res.status(403).json({
          success: false,
          message: 'Bài học chưa được phát hành',
        });
      }

      return res.status(200).json({
        success: true,
        data: lesson,
        message: 'Lấy thông tin bài học thành công',
      });
    } catch (error) {
      console.error('LessonController.getById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy thông tin bài học',
      });
    }
  }
}
