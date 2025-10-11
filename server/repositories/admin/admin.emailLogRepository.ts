import db from "../../config/db";
import { EmailLog } from "../../models/EmailLog";

export class EmailLogRepository {
  static async initTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaignId INT NOT NULL,
        userId INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        sentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status ENUM('sent', 'failed') NOT NULL,
        errorMessage TEXT,
        INDEX idx_campaign_user (campaignId, userId),
        INDEX idx_campaign_status (campaignId, status)
      )
    `);
  }

  static async findByCampaignAndUser(
    campaignId: number,
    userId: number
  ): Promise<EmailLog | null> {
    const results = await db.query(
      `SELECT id, campaignId, userId, email, sentAt, status, errorMessage 
       FROM email_logs 
       WHERE campaignId = ? AND userId = ? 
       LIMIT 1`,
      [campaignId, userId]
    );

    if (Array.isArray(results) && results.length === 0) {
      return null;
    }

    const logData = results[0] as any;
    return new EmailLog(logData);
  }

  static async createLog(logData: {
    campaignId: number;
    userId: number;
    email: string;
    status: "sent" | "failed";
    errorMessage?: string;
  }): Promise<EmailLog> {
    const result = await db.query(
      `INSERT INTO email_logs (campaignId, userId, email, status, errorMessage) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        logData.campaignId,
        logData.userId,
        logData.email,
        logData.status,
        logData.errorMessage,
      ]
    );

    const newLog = new EmailLog({
      id: result.insertId,
      ...logData,
    });

    return newLog;
  }

  static async getSentEmailsForCampaign(
    campaignId: number
  ): Promise<EmailLog[]> {
    const results = await db.query(
      `SELECT id, campaignId, userId, email, sentAt, status, errorMessage 
       FROM email_logs 
       WHERE campaignId = ? AND status = 'sent'`,
      [campaignId]
    );

    return results.map((logData: any) => new EmailLog(logData));
  }

  static async getFailedEmailsForCampaign(
    campaignId: number
  ): Promise<EmailLog[]> {
    const results = await db.query(
      `SELECT id, campaignId, userId, email, sentAt, status, errorMessage 
       FROM email_logs 
       WHERE campaignId = ? AND status = 'failed'`,
      [campaignId]
    );

    return results.map((logData: any) => new EmailLog(logData));
  }
}
