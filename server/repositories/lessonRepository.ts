import db from '../config/db';
import { Lesson } from '../models/Lesson';
import { LessonBuilder } from '../builder/LessonBuilder';
import { LessonCaption } from '../models/LessonCaption';
import { LessonCaptionBuilder } from '../builder/LessonCaptionBuilder';

export interface LessonFilters {
  status?: string;
  topic?: string;
  search?: string;
  includeCaptions?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'title' | 'duration_sec';
  orderDirection?: 'asc' | 'desc';
}

export interface LessonCaptionInput {
  language?: string;
  startMs: number;
  endMs: number;
  text: string;
  orderIndex?: number | null;
}

export interface CreateLessonInput {
  title: string;
  videoUrl: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  durationSec?: number | null;
  topic?: string | null;
  status?: string;
  level?: string | null;
  language?: string | null;
  tags?: string[] | null;
  transcriptUrl?: string | null;
  captions?: LessonCaptionInput[];
}

export interface UpdateLessonInput extends Partial<CreateLessonInput> {}

export class LessonRepository {
  static async findAll(filters: LessonFilters = {}): Promise<Lesson[]> {
    const {
      status,
      topic,
      search,
      includeCaptions = false,
      limit,
      offset,
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = filters;

    const whereClauses: string[] = [];
    const values: any[] = [];

    if (status) {
      whereClauses.push('status = ?');
      values.push(status);
    }

    if (topic) {
      whereClauses.push('topic = ?');
      values.push(topic);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR description LIKE ?)');
      const like = `%${search}%`;
      values.push(like, like);
    }

    let sql = `SELECT id, title, video_url, description, thumbnail_url, duration_sec, topic, status, level, language, tags, transcript_url, created_at, updated_at
               FROM lessons`;

    if (whereClauses.length) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const allowedOrderColumns = new Set(['created_at', 'updated_at', 'title', 'duration_sec']);
    const orderColumn = allowedOrderColumns.has(orderBy) ? orderBy : 'created_at';
    const direction = orderDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${orderColumn} ${direction}`;

    if (typeof limit === 'number' && limit > 0) {
      sql += ' LIMIT ?';
      values.push(limit);

      if (typeof offset === 'number' && offset >= 0) {
        sql += ' OFFSET ?';
        values.push(offset);
      }
    }

    const rows = await db.query(sql, values);
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    if (!includeCaptions) {
      return rows.map((row: any) => this.mapLessonRow(row));
    }

    const lessonIds = rows.map((row: any) => Number(row.id));
    const captionsMap = await this.getCaptionsForLessons(lessonIds);

    return rows.map((row: any) => {
      const captions = captionsMap.get(Number(row.id)) ?? [];
      return this.mapLessonRow(row, captions);
    });
  }

  static async findById(id: number, options: { includeCaptions?: boolean } = {}): Promise<Lesson | null> {
    const { includeCaptions = true } = options;

    const rows = await db.query(
      `SELECT id, title, video_url, description, thumbnail_url, duration_sec, topic, status, level, language, tags, transcript_url, created_at, updated_at
       FROM lessons
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const lessonRow = rows[0];
    let captions: LessonCaption[] = [];

    if (includeCaptions) {
      captions = await this.getCaptionsForLesson(id);
    }

    return this.mapLessonRow(lessonRow, captions);
  }

  static async create(input: CreateLessonInput): Promise<Lesson> {
    const tagsValue = input.tags && input.tags.length ? JSON.stringify([...new Set(input.tags)]) : null;
    const statusValue = input.status ?? 'draft';

    const result = await db.query(
      `INSERT INTO lessons (title, video_url, description, thumbnail_url, duration_sec, topic, status, level, language, tags, transcript_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        input.title,
        input.videoUrl,
        input.description ?? null,
        input.thumbnailUrl ?? null,
        input.durationSec ?? null,
        input.topic ?? null,
        statusValue,
        input.level ?? null,
        input.language ?? null,
        tagsValue,
        input.transcriptUrl ?? null,
      ]
    );

    const lessonId = result.insertId as number;

    if (input.captions && input.captions.length) {
      await this.replaceCaptions(lessonId, input.captions);
    }

    const createdLesson = await this.findById(lessonId, { includeCaptions: true });
    if (!createdLesson) {
      throw new Error('Failed to load lesson after creation');
    }
    return createdLesson;
  }

  static async update(id: number, input: UpdateLessonInput): Promise<Lesson | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (input.title !== undefined) {
      fields.push('title = ?');
      values.push(input.title);
    }
    if (input.videoUrl !== undefined) {
      fields.push('video_url = ?');
      values.push(input.videoUrl);
    }
    if (input.description !== undefined) {
      fields.push('description = ?');
      values.push(input.description ?? null);
    }
    if (input.thumbnailUrl !== undefined) {
      fields.push('thumbnail_url = ?');
      values.push(input.thumbnailUrl ?? null);
    }
    if (input.durationSec !== undefined) {
      fields.push('duration_sec = ?');
      values.push(input.durationSec ?? null);
    }
    if (input.topic !== undefined) {
      fields.push('topic = ?');
      values.push(input.topic ?? null);
    }
    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }
    if (input.level !== undefined) {
      fields.push('level = ?');
      values.push(input.level ?? null);
    }
    if (input.language !== undefined) {
      fields.push('language = ?');
      values.push(input.language ?? null);
    }
    if (input.tags !== undefined) {
      const tagsValue = input.tags && input.tags.length ? JSON.stringify([...new Set(input.tags)]) : null;
      fields.push('tags = ?');
      values.push(tagsValue);
    }
    if (input.transcriptUrl !== undefined) {
      fields.push('transcript_url = ?');
      values.push(input.transcriptUrl ?? null);
    }

    if (fields.length) {
      fields.push('updated_at = NOW()');
      const sql = `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      const result = await db.query(sql, values);
      if (!result || result.affectedRows === 0) {
        return null;
      }
    } else if (input.captions) {
      await db.query('UPDATE lessons SET updated_at = NOW() WHERE id = ?', [id]);
    }

    if (input.captions) {
      await this.replaceCaptions(id, input.captions);
    }

    return await this.findById(id, { includeCaptions: true });
  }

  static async delete(id: number): Promise<boolean> {
    await db.query('DELETE FROM lesson_captions WHERE lesson_id = ?', [id]);
    const result = await db.query('DELETE FROM lessons WHERE id = ?', [id]);
    return !!result && result.affectedRows > 0;
  }

  static async replaceCaptions(lessonId: number, captions: LessonCaptionInput[]): Promise<void> {
    await db.query('DELETE FROM lesson_captions WHERE lesson_id = ?', [lessonId]);

    if (!captions.length) {
      return;
    }

    const sortedCaptions = [...captions].sort((a, b) => {
      const orderA = a.orderIndex ?? a.startMs;
      const orderB = b.orderIndex ?? b.startMs;
      return orderA - orderB;
    });

    const placeholders: string[] = [];
    const values: any[] = [];

    sortedCaptions.forEach((caption, index) => {
      placeholders.push('(?, ?, ?, ?, ?, ?, NOW(), NOW())');
      values.push(
        lessonId,
        caption.language ?? 'vi',
        caption.startMs,
        caption.endMs,
        caption.text,
        caption.orderIndex ?? index
      );
    });

    const sql = `INSERT INTO lesson_captions (lesson_id, language, start_ms, end_ms, text, order_index, created_at, updated_at)
                 VALUES ${placeholders.join(', ')}`;
    await db.query(sql, values);
  }

  private static async getCaptionsForLessons(lessonIds: number[]): Promise<Map<number, LessonCaption[]>> {
    if (!lessonIds.length) {
      return new Map();
    }

    const placeholders = lessonIds.map(() => '?').join(',');
    const sql = `SELECT id, lesson_id, language, start_ms, end_ms, text, order_index, created_at, updated_at
                 FROM lesson_captions
                 WHERE lesson_id IN (${placeholders})
                 ORDER BY lesson_id, order_index ASC, start_ms ASC`;
    const rows = await db.query(sql, lessonIds);

    const captionsMap = new Map<number, LessonCaption[]>();

    if (!Array.isArray(rows)) {
      return captionsMap;
    }

    rows.forEach((row: any) => {
      const caption = this.mapCaptionRow(row);
      const list = captionsMap.get(caption.lessonId) ?? [];
      list.push(caption);
      captionsMap.set(caption.lessonId, list);
    });

    return captionsMap;
  }

  private static async getCaptionsForLesson(lessonId: number): Promise<LessonCaption[]> {
    const rows = await db.query(
      `SELECT id, lesson_id, language, start_ms, end_ms, text, order_index, created_at, updated_at
       FROM lesson_captions
       WHERE lesson_id = ?
       ORDER BY order_index ASC, start_ms ASC`,
      [lessonId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    return rows.map((row: any) => this.mapCaptionRow(row));
  }

  private static mapLessonRow(row: any, captions: LessonCaption[] = []): Lesson {
    const tags = this.deserializeTags(row.tags);

    return new LessonBuilder()
      .setId(Number(row.id))
      .setTitle(row.title)
      .setVideoUrl(row.video_url)
      .setDescription(row.description ?? null)
      .setThumbnailUrl(row.thumbnail_url ?? null)
      .setDurationSec(row.duration_sec !== null && row.duration_sec !== undefined ? Number(row.duration_sec) : null)
      .setTopic(row.topic ?? null)
      .setStatus(row.status ?? 'draft')
      .setLevel(row.level ?? null)
      .setLanguage(row.language ?? null)
      .setTags(tags)
      .setTranscriptUrl(row.transcript_url ?? null)
      .setCaptions(captions)
      .setCreatedAt(row.created_at ?? null)
      .setUpdatedAt(row.updated_at ?? null)
      .build();
  }

  private static mapCaptionRow(row: any): LessonCaption {
    const builder = new LessonCaptionBuilder()
      .setLessonId(Number(row.lesson_id))
      .setLanguage(row.language ?? 'vi')
      .setStartMs(Number(row.start_ms))
      .setEndMs(Number(row.end_ms))
      .setText(row.text)
      .setOrderIndex(row.order_index !== null && row.order_index !== undefined ? Number(row.order_index) : null)
      .setCreatedAt(row.created_at ?? null)
      .setUpdatedAt(row.updated_at ?? null);

    if (row.id !== null && row.id !== undefined) {
      builder.setId(Number(row.id));
    }

    return builder.build();
  }

  private static deserializeTags(raw: any): string[] | null {
    if (!raw) {
      return null;
    }

    if (Array.isArray(raw)) {
      return raw.map(String);
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) {
        return null;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item));
        }
      } catch (error) {
        // Not a JSON string, fallback to comma-separated values
        return trimmed
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      return [trimmed];
    }

    return null;
  }
}
