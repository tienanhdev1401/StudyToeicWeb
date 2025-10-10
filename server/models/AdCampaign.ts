export type AdCampaignStatus = "scheduled" | "running" | "paused" | "completed" | "cancelled";

export class AdCampaign {
  id: number | null;
  advertisementId: number;
  startDate: Date;
  endDate: Date;
  status: AdCampaignStatus;
  createdAt: Date | null;

  constructor(
    id: number | null,
    advertisementId: number,
    startDate: Date,
    endDate: Date,
    status: AdCampaignStatus,
    createdAt: Date | null
  ) {
    this.id = id;
    this.advertisementId = advertisementId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.createdAt = createdAt;
  }
}
