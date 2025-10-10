export class EmailLog {
  id?: number;
  campaignId: number;
  userId: number;
  email: string;
  sentAt: Date;
  status: "sent" | "failed";
  errorMessage?: string;

  constructor(emailLogData: {
    id?: number;
    campaignId: number;
    userId: number;
    email: string;
    sentAt?: Date | string;
    status: "sent" | "failed";
    errorMessage?: string;
  }) {
    this.id = emailLogData.id;
    this.campaignId = emailLogData.campaignId;
    this.userId = emailLogData.userId;
    this.email = emailLogData.email;
    this.status = emailLogData.status;
    this.errorMessage = emailLogData.errorMessage;

    this.sentAt =
      emailLogData.sentAt instanceof Date
        ? emailLogData.sentAt
        : emailLogData.sentAt
        ? new Date(emailLogData.sentAt)
        : new Date();
  }
}
