import db from "../../config/db";
import { AdCampaign, AdCampaignStatus } from "../../models/AdCampaign";

export class AdCampaignRepository {
  static async initTable(): Promise<void> {
    await db.query(
      `CREATE TABLE IF NOT EXISTS ad_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        advertisementId INT NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        status ENUM('scheduled','running','paused','completed','cancelled') NOT NULL DEFAULT 'scheduled',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_ad_campaign_advertisement FOREIGN KEY (advertisementId)
          REFERENCES advertisements(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    );
  }

  static async create(
    c: Omit<AdCampaign, "id" | "createdAt" | "status"> & {
      status?: AdCampaignStatus;
    }
  ): Promise<number> {
    const status = c.status || "scheduled";
    const result = await db.query(
      `INSERT INTO ad_campaigns (advertisementId, startDate, endDate, status) VALUES (?, ?, ?, ?)`,
      [c.advertisementId, c.startDate, c.endDate, status]
    );
    return (result as any).insertId as number;
  }

  static async updateStatus(
    id: number,
    status: AdCampaignStatus
  ): Promise<void> {
    await db.query(`UPDATE ad_campaigns SET status = ? WHERE id = ?`, [
      status,
      id,
    ]);
  }

  static async update(
    id: number,
    data: {
      advertisementId: number;
      startDate: Date;
      endDate: Date;
    }
  ): Promise<void> {
    await db.query(
      `UPDATE ad_campaigns SET advertisementId = ?, startDate = ?, endDate = ? WHERE id = ?`,
      [data.advertisementId, data.startDate, data.endDate, id]
    );
  }

  static async findAll(): Promise<AdCampaign[]> {
    const rows = await db.query(`SELECT * FROM ad_campaigns ORDER BY id DESC`);
    return rows.map(
      (r: any) =>
        new AdCampaign(
          r.id,
          r.advertisementId,
          new Date(r.startDate),
          new Date(r.endDate),
          r.status,
          r.createdAt ? new Date(r.createdAt) : null
        )
    );
  }

  static async findById(id: number): Promise<AdCampaign | null> {
    const rows = await db.query(
      `SELECT * FROM ad_campaigns WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return new AdCampaign(
      r.id,
      r.advertisementId,
      new Date(r.startDate),
      new Date(r.endDate),
      r.status,
      r.createdAt ? new Date(r.createdAt) : null
    );
  }

  static async delete(id: number): Promise<void> {
    await db.query(`DELETE FROM ad_campaigns WHERE id = ?`, [id]);
  }

  static async findPendingAndRunning(): Promise<AdCampaign[]> {
    const rows = await db.query(
      `SELECT * FROM ad_campaigns WHERE status IN ('scheduled','running')`
    );
    return rows.map(
      (r: any) =>
        new AdCampaign(
          r.id,
          r.advertisementId,
          new Date(r.startDate),
          new Date(r.endDate),
          r.status,
          r.createdAt ? new Date(r.createdAt) : null
        )
    );
  }
}
