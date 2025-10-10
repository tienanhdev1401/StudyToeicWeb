import { Request, Response } from "express";
import { AdCampaignRepository } from "../../repositories/admin/admin.adCampaignRepository";
import { AdvertisementRepository } from "../../repositories/admin/admin.advertisementRepository";
import { SchedulerService } from "../../services/scheduler/SchedulerService";

export class AdCampaignController {
  static async create(req: Request, res: Response) {
    try {
      const { advertisementId, startDate, endDate } = req.body;
      if (!advertisementId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "advertisementId, startDate, endDate là bắt buộc",
        });
      }
      const ad = await AdvertisementRepository.findById(
        Number(advertisementId)
      );
      if (!ad)
        return res
          .status(404)
          .json({ success: false, message: "Advertisement not found" });

      const id = await AdCampaignRepository.create({
        advertisementId: Number(advertisementId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "scheduled",
      });

      // schedule job
      await SchedulerService.reloadCampaign(id);

      return res.status(201).json({ success: true, data: { id } });
    } catch (e) {
      console.error("Create campaign error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const items = await AdCampaignRepository.findAll();
      return res.json({ success: true, data: items });
    } catch (e) {
      console.error("List campaigns error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await SchedulerService.cancelCampaign(id);
      await AdCampaignRepository.updateStatus(id, "cancelled");
      return res.json({ success: true });
    } catch (e) {
      console.error("Cancel campaign error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async triggerOverdue(req: Request, res: Response) {
    try {
      await SchedulerService.triggerOverdueCampaigns();
      return res.json({
        success: true,
        message: "Overdue campaigns triggered successfully",
      });
    } catch (e) {
      console.error("Trigger overdue campaigns error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async triggerRunning(req: Request, res: Response) {
    try {
      await SchedulerService.triggerRunningCampaigns();
      return res.json({
        success: true,
        message: "Running campaigns triggered successfully",
      });
    } catch (e) {
      console.error("Trigger running campaigns error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { advertisementId, startDate, endDate } = req.body;

      if (!advertisementId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "advertisementId, startDate, endDate are required",
        });
      }

      const campaign = await AdCampaignRepository.findById(Number(id));
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      // Check if campaign can be updated (only scheduled campaigns can be updated)
      if (campaign.status !== "scheduled") {
        return res.status(400).json({
          success: false,
          message: "Only scheduled campaigns can be updated",
        });
      }

      // Verify advertisement exists
      const ad = await AdvertisementRepository.findById(
        Number(advertisementId)
      );
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: "Advertisement not found",
        });
      }

      // Update campaign
      await AdCampaignRepository.update(Number(id), {
        advertisementId: Number(advertisementId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      // Reschedule the campaign
      await SchedulerService.reloadCampaign(Number(id));

      return res.status(200).json({
        success: true,
        message: "Campaign updated successfully",
      });
    } catch (e) {
      console.error("Update campaign error", e);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async pause(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const campaign = await AdCampaignRepository.findById(Number(id));
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      if (campaign.status !== "running") {
        return res.status(400).json({
          success: false,
          message: "Only running campaigns can be paused",
        });
      }

      await AdCampaignRepository.updateStatus(Number(id), "paused");

      // Cancel the scheduled end job for this campaign
      await SchedulerService.cancelCampaign(Number(id));

      return res.status(200).json({
        success: true,
        message: "Campaign paused successfully",
      });
    } catch (e) {
      console.error("Pause campaign error", e);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async resume(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const campaign = await AdCampaignRepository.findById(Number(id));
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      if (campaign.status !== "paused") {
        return res.status(400).json({
          success: false,
          message: "Only paused campaigns can be resumed",
        });
      }

      await AdCampaignRepository.updateStatus(Number(id), "running");

      // Reschedule the campaign
      await SchedulerService.reloadCampaign(Number(id));

      return res.status(200).json({
        success: true,
        message: "Campaign resumed successfully",
      });
    } catch (e) {
      console.error("Resume campaign error", e);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
