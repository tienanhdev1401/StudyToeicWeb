import { Request, Response } from 'express';
import {
  CreateLessonInput,
  LessonCaptionInput,
  LessonFilters,
  LessonRepository,
  UpdateLessonInput,
} from '../../repositories/lessonRepository';

const ALLOWED_STATUSES = new Set(['draft', 'published', 'archived']);

export class AdminLessonController {
  static async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);
      const offset = (page - 1) * limit;

      const filters: LessonFilters = {
        status: req.query.status as string | undefined,
        topic: req.query.topic as string | undefined,
        search: req.query.search as string | undefined,
        includeCaptions: (req.query.includeCaptions as string) === 'true',
        orderBy: (req.query.orderBy as any) || 'updated_at',
        orderDirection: (req.query.orderDirection as any) || 'desc',
        limit,
        offset,
      };

      const lessons = await LessonRepository.findAll(filters);

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
      console.error('AdminLessonController.list error:', error);
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

      return res.status(200).json({
        success: true,
        data: lesson,
        message: 'Lấy thông tin bài học thành công',
      });
    } catch (error) {
      console.error('AdminLessonController.getById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy thông tin bài học',
      });
    }
  }

  static async create(req: Request, res: Response) {
    const errors: string[] = [];
    const body = req.body || {};

    if (!body.title || typeof body.title !== 'string') {
      errors.push('Trường title là bắt buộc và phải là chuỗi.');
    }

    if (!body.videoUrl || typeof body.videoUrl !== 'string') {
      errors.push('Trường videoUrl là bắt buộc và phải là chuỗi.');
    }

    const durationSec = AdminLessonController.parseOptionalNumber(body.durationSec, 'durationSec', errors);
    const tags = AdminLessonController.normalizeTags(body.tags);
    const status = AdminLessonController.normalizeStatus(body.status, errors);
    const captions = AdminLessonController.normalizeCaptions(body.captions, errors);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors,
      });
    }

    const payload: CreateLessonInput = {
      title: body.title.trim(),
      videoUrl: body.videoUrl.trim(),
      description: AdminLessonController.optionalTrim(body.description),
      thumbnailUrl: AdminLessonController.optionalTrim(body.thumbnailUrl),
      durationSec: durationSec ?? null,
      topic: AdminLessonController.optionalTrim(body.topic),
      status: status ?? 'draft',
      level: AdminLessonController.optionalTrim(body.level),
      language: AdminLessonController.optionalTrim(body.language),
      tags,
      transcriptUrl: AdminLessonController.optionalTrim(body.transcriptUrl),
      captions,
    };

    try {
      const lesson = await LessonRepository.create(payload);
      return res.status(201).json({
        success: true,
        data: lesson,
        message: 'Tạo bài học thành công',
      });
    } catch (error) {
      console.error('AdminLessonController.create error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể tạo bài học',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài học không hợp lệ',
        });
      }

      const body = req.body || {};
      const errors: string[] = [];
      const payload: UpdateLessonInput = {};

      if (body.title !== undefined) {
        if (typeof body.title !== 'string' || !body.title.trim()) {
          errors.push('Trường title phải là chuỗi hợp lệ.');
        } else {
          payload.title = body.title.trim();
        }
      }

      if (body.videoUrl !== undefined) {
        if (typeof body.videoUrl !== 'string' || !body.videoUrl.trim()) {
          errors.push('Trường videoUrl phải là chuỗi hợp lệ.');
        } else {
          payload.videoUrl = body.videoUrl.trim();
        }
      }

      if (body.description !== undefined) {
        payload.description = AdminLessonController.optionalTrim(body.description);
      }

      if (body.thumbnailUrl !== undefined) {
        payload.thumbnailUrl = AdminLessonController.optionalTrim(body.thumbnailUrl);
      }

      if (body.durationSec !== undefined) {
        const durationSec = AdminLessonController.parseOptionalNumber(body.durationSec, 'durationSec', errors);
        if (durationSec !== undefined) {
          payload.durationSec = durationSec;
        }
      }

      if (body.topic !== undefined) {
        payload.topic = AdminLessonController.optionalTrim(body.topic);
      }

      if (body.status !== undefined) {
        const status = AdminLessonController.normalizeStatus(body.status, errors);
        if (status) {
          payload.status = status;
        }
      }

      if (body.level !== undefined) {
        payload.level = AdminLessonController.optionalTrim(body.level);
      }

      if (body.language !== undefined) {
        payload.language = AdminLessonController.optionalTrim(body.language);
      }

      if (body.tags !== undefined) {
        payload.tags = AdminLessonController.normalizeTags(body.tags);
      }

      if (body.transcriptUrl !== undefined) {
        payload.transcriptUrl = AdminLessonController.optionalTrim(body.transcriptUrl);
      }

      if (body.captions !== undefined) {
        payload.captions = AdminLessonController.normalizeCaptions(body.captions, errors);
      }

      if (errors.length) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors,
        });
      }

      const lesson = await LessonRepository.update(id, payload);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài học',
        });
      }

      return res.status(200).json({
        success: true,
        data: lesson,
        message: 'Cập nhật bài học thành công',
      });
    } catch (error) {
      console.error('AdminLessonController.update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật bài học',
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài học không hợp lệ',
        });
      }

      const { status } = req.body || {};
      const errors: string[] = [];
      const normalizedStatus = this.normalizeStatus(status, errors);

      if (errors.length || !normalizedStatus) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ',
          errors: errors.length ? errors : ['Trạng thái không hợp lệ'],
        });
      }

      const lesson = await LessonRepository.update(id, { status: normalizedStatus });
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài học',
        });
      }

      return res.status(200).json({
        success: true,
        data: lesson,
        message: 'Cập nhật trạng thái bài học thành công',
      });
    } catch (error) {
      console.error('AdminLessonController.updateStatus error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật trạng thái bài học',
      });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID bài học không hợp lệ',
        });
      }

      const deleted = await LessonRepository.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài học',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Xóa bài học thành công',
      });
    } catch (error) {
      console.error('AdminLessonController.remove error:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể xóa bài học',
      });
    }
  }

  private static optionalTrim(value: any): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value !== 'string') {
      return String(value);
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private static parseOptionalNumber(value: any, field: string, errors: string[]): number | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      errors.push(`${field} phải là số không âm.`);
      return undefined;
    }

    return parsed;
  }

  private static normalizeTags(value: any): string[] | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
        .filter((item) => item.length > 0);
      return normalized.length ? normalized : null;
    }

    if (typeof value === 'string') {
      const normalized = value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      return normalized.length ? normalized : null;
    }

    return null;
  }

  private static normalizeStatus(value: any, errors: string[]): string | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const status = String(value).toLowerCase();
    if (!ALLOWED_STATUSES.has(status)) {
      errors.push(`Trạng thái ${status} không hợp lệ.`);
      return null;
    }

    return status;
  }

  private static normalizeCaptions(value: any, errors: string[]): LessonCaptionInput[] {
    if (value === undefined || value === null) {
      return [];
    }

    if (!Array.isArray(value)) {
      errors.push('captions phải là một mảng.');
      return [];
    }

    const captions: LessonCaptionInput[] = [];

    value.forEach((item, index) => {
      if (!item) {
        return;
      }

      const startMs = Number(item.startMs ?? item.start_ms ?? item.start);
      const endMs = Number(item.endMs ?? item.end_ms ?? item.end);

      if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
        errors.push(`Caption tại vị trí ${index} thiếu startMs hoặc endMs hợp lệ.`);
        return;
      }

      if (typeof item.text !== 'string' || !item.text.trim()) {
        errors.push(`Caption tại vị trí ${index} thiếu text hợp lệ.`);
        return;
      }

      const orderIndexRaw = item.orderIndex ?? item.order_index ?? index;
      const orderIndex = Number(orderIndexRaw);

      captions.push({
        language: item.language ? String(item.language) : 'vi',
        startMs,
        endMs,
        text: item.text.trim(),
        orderIndex: Number.isNaN(orderIndex) ? index : orderIndex,
      });
    });

    return captions;
  }
}
