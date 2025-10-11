import db from '../config/db';
import { Blog } from '../models/Blog';

export interface BlogListOptions {
  search?: string;
  author?: string;
  orderBy?: 'createdAt' | 'updatedAt' | 'title';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class PublicBlogRepository {
  static async findAndCount(options: BlogListOptions = {}): Promise<{ data: Blog[]; total: number }> {
    const {
      search,
      author,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      limit,
      offset,
    } = options;

    const whereClauses: string[] = [];
    const filterValues: any[] = [];

    if (search) {
      whereClauses.push('(title LIKE ? OR content LIKE ?)');
      const like = `%${search}%`;
      filterValues.push(like, like);
    }

    if (author) {
      whereClauses.push('author = ?');
      filterValues.push(author);
    }

    const whereSql = whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM blogs${whereSql}`;
    const countRows = await db.query(countSql, filterValues);
    const total = Array.isArray(countRows) && countRows.length > 0 ? Number(countRows[0].total) : 0;

    const allowedOrderColumns = new Set(['createdAt', 'updatedAt', 'title']);
    const orderColumn = allowedOrderColumns.has(orderBy) ? orderBy : 'createdAt';
    const direction = orderDirection === 'asc' ? 'ASC' : 'DESC';

    const dataSqlParts = [
      'SELECT id, title, content, imageUrl, author, createdAt, updatedAt',
      'FROM blogs',
      whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '',
      `ORDER BY ${orderColumn} ${direction}`,
    ].filter(Boolean);

    const dataValues = [...filterValues];

    if (typeof limit === 'number' && limit > 0) {
      dataSqlParts.push('LIMIT ?');
      dataValues.push(limit);

      if (typeof offset === 'number' && offset >= 0) {
        dataSqlParts.push('OFFSET ?');
        dataValues.push(offset);
      }
    }

    const dataSql = dataSqlParts.join(' ');
    const rows = await db.query(dataSql, dataValues);

    const data: Blog[] = Array.isArray(rows)
      ? rows.map((row: any) =>
          new Blog(
            row.id,
            row.title,
            row.content,
            row.imageUrl ?? null,
            row.author,
            row.createdAt,
            row.updatedAt
          )
        )
      : [];

    return {
      data,
      total,
    };
  }

  static async findById(id: number): Promise<Blog | null> {
    const rows = await db.query(
      `SELECT id, title, content, imageUrl, author, createdAt, updatedAt
       FROM blogs
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const blog = rows[0];
    return new Blog(
      blog.id,
      blog.title,
      blog.content,
      blog.imageUrl ?? null,
      blog.author,
      blog.createdAt,
      blog.updatedAt
    );
  }
}
