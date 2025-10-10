import { AdvertisementRepository } from "../../repositories/admin/admin.advertisementRepository";
import { AdCampaignRepository } from "../../repositories/admin/admin.adCampaignRepository";
import { EmailLogRepository } from "../../repositories/admin/admin.emailLogRepository";

export async function initMarketingSchema(): Promise<void> {
  await AdvertisementRepository.initTable();
  await AdCampaignRepository.initTable();
  await EmailLogRepository.initTable();
}
