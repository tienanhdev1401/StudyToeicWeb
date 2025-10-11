import db from "../../config/db";
import { Advertisement } from "../../models/Advertisement";

export class AdvertisementRepository {
  static async initTable(): Promise<void> {
    await db.query(
      `CREATE TABLE IF NOT EXISTS advertisements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        htmlContent MEDIUMTEXT NOT NULL,
        imageUrl VARCHAR(500) NULL,
        targetUrl VARCHAR(500) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    );
  }

  static async create(
    ad: Omit<Advertisement, "id" | "createdAt">
  ): Promise<number> {
    const result = await db.query(
      `INSERT INTO advertisements (title, htmlContent, imageUrl, targetUrl) VALUES (?, ?, ?, ?)`,
      [ad.title, ad.htmlContent, ad.imageUrl, ad.targetUrl]
    );
    return (result as any).insertId as number;
  }

  static async findAll(): Promise<Advertisement[]> {
    const rows = await db.query(
      `SELECT * FROM advertisements ORDER BY id DESC`
    );
    return rows.map(
      (r: any) =>
        new Advertisement(
          r.id,
          r.title,
          r.htmlContent,
          r.imageUrl,
          r.targetUrl,
          r.createdAt ? new Date(r.createdAt) : null
        )
    );
  }

  static async findById(id: number): Promise<Advertisement | null> {
    const rows = await db.query(
      `SELECT * FROM advertisements WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return new Advertisement(
      r.id,
      r.title,
      r.htmlContent,
      r.imageUrl,
      r.targetUrl,
      r.createdAt ? new Date(r.createdAt) : null
    );
  }

  static async update(
    id: number,
    data: {
      title: string;
      htmlContent: string;
      imageUrl: string | null;
      targetUrl: string | null;
    }
  ): Promise<void> {
    await db.query(
      `UPDATE advertisements SET title = ?, htmlContent = ?, imageUrl = ?, targetUrl = ? WHERE id = ?`,
      [data.title, data.htmlContent, data.imageUrl, data.targetUrl, id]
    );
  }

  static async delete(id: number): Promise<void> {
    await db.query(`DELETE FROM advertisements WHERE id = ?`, [id]);
  }
}
