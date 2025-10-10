import schedule, { Job } from "node-schedule";
import { AdCampaignRepository } from "../../repositories/admin/admin.adCampaignRepository";
import { AdvertisementRepository } from "../../repositories/admin/admin.advertisementRepository";
import { EmailLogRepository } from "../../repositories/admin/admin.emailLogRepository";
import {
  LearnerRepository,
  transporter,
} from "../../repositories/admin/admin.LearnerRepository";

type JobMap = { [key: string]: Job };

export class SchedulerService {
  private static jobs: JobMap = {};
  private static checkInterval: NodeJS.Timeout | null = null;

  static async init(): Promise<void> {
    // Load existing scheduled/running campaigns and register jobs
    const campaigns = await AdCampaignRepository.findPendingAndRunning();
    console.log("Loading campaigns:", campaigns);

    for (const c of campaigns) {
      const now = new Date();

      // If campaign start date has passed but still scheduled, execute immediately
      if (c.status === "scheduled" && c.startDate <= now) {
        console.log(
          `Campaign ${c.id} start date has passed, executing immediately`
        );
        await AdCampaignRepository.updateStatus(c.id!, "running");
        await this.executeDelivery(c.id!);

        // Still schedule the end job
        await this.scheduleEndJob(c.id!, c.endDate);
      }
      // If campaign is already running, execute delivery immediately
      else if (c.status === "running") {
        console.log(
          `Campaign ${c.id} is already running, executing delivery immediately`
        );
        await this.executeDelivery(c.id!);

        // Schedule end job if not already scheduled
        if (!this.jobs[`end-${c.id}`]) {
          await this.scheduleEndJob(c.id!, c.endDate);
        }
      } else {
        // Schedule normally for future campaigns
        await this.scheduleCampaign(c.id!);
      }
    }

    // Start periodic check for overdue campaigns (every 5 minutes)
    this.startPeriodicCheck();
  }

  static async scheduleCampaign(campaignId: number): Promise<void> {
    // Cancel if already exists
    await this.cancelCampaign(campaignId);

    const campaign = await AdCampaignRepository.findById(campaignId);
    if (!campaign) return;

    console.log("Scheduling campaign:", campaign);

    // Schedule start job
    const startJob = schedule.scheduleJob(
      `campaign-start-${campaignId}`,
      campaign.startDate,
      async () => {
        console.log(`Campaign ${campaignId} start job triggered`);
        await AdCampaignRepository.updateStatus(campaignId, "running");
        await this.executeDelivery(campaignId);
      }
    );
    this.jobs[`start-${campaignId}`] = startJob;

    // Schedule end job
    await this.scheduleEndJob(campaignId, campaign.endDate);
  }

  private static async scheduleEndJob(
    campaignId: number,
    endDate: Date
  ): Promise<void> {
    const endJob = schedule.scheduleJob(
      `campaign-end-${campaignId}`,
      endDate,
      async () => {
        console.log(`Campaign ${campaignId} end job triggered`);
        await AdCampaignRepository.updateStatus(campaignId, "completed");
        await this.cancelCampaign(campaignId);
      }
    );
    this.jobs[`end-${campaignId}`] = endJob;
  }

  static async cancelCampaign(campaignId: number): Promise<void> {
    const startKey = `start-${campaignId}`;
    const endKey = `end-${campaignId}`;
    if (this.jobs[startKey]) {
      this.jobs[startKey].cancel();
      delete this.jobs[startKey];
    }
    if (this.jobs[endKey]) {
      this.jobs[endKey].cancel();
      delete this.jobs[endKey];
    }
  }

  // Method to manually trigger overdue campaigns
  static async triggerOverdueCampaigns(): Promise<void> {
    const campaigns = await AdCampaignRepository.findPendingAndRunning();
    const now = new Date();
    let triggeredCount = 0;

    console.log("campaigns", campaigns);
    for (const campaign of campaigns) {
      if (campaign.status === "scheduled" && campaign.startDate <= now) {
        console.log(
          `Triggering overdue campaign ${campaign.id} (startDate: ${campaign.startDate})`
        );
        await AdCampaignRepository.updateStatus(campaign.id!, "running");
        await this.executeDelivery(campaign.id!);

        // Schedule end job if not already scheduled
        if (!this.jobs[`end-${campaign.id}`]) {
          await this.scheduleEndJob(campaign.id!, campaign.endDate);
        }
        triggeredCount++;
      }
    }

    console.log(`Triggered ${triggeredCount} overdue campaigns`);
  }

  // Method to manually trigger delivery for running campaigns
  static async triggerRunningCampaigns(): Promise<void> {
    const campaigns = await AdCampaignRepository.findPendingAndRunning();
    let triggeredCount = 0;

    for (const campaign of campaigns) {
      if (campaign.status === "running") {
        console.log(`Triggering delivery for running campaign ${campaign.id}`);
        await this.executeDelivery(campaign.id!);
        triggeredCount++;
      }
    }

    console.log(`Triggered delivery for ${triggeredCount} running campaigns`);
  }

  // Start periodic check for overdue campaigns
  private static startPeriodicCheck(): void {
    // Clear existing interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every 5 minutes
    this.checkInterval = setInterval(async () => {
      try {
        console.log("Performing periodic check for overdue campaigns...");
        await this.triggerOverdueCampaigns();
      } catch (error) {
        console.error("Error in periodic campaign check:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log("Started periodic campaign check (every 5 minutes)");
  }

  // Stop periodic check
  static stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("Stopped periodic campaign check");
    }
  }

  // Reload a specific campaign (useful when new campaign is created)
  static async reloadCampaign(campaignId: number): Promise<void> {
    const campaign = await AdCampaignRepository.findById(campaignId);
    if (!campaign) {
      console.log(`Campaign ${campaignId} not found`);
      return;
    }

    const now = new Date();

    // If campaign start date has passed, execute immediately
    if (campaign.status === "scheduled" && campaign.startDate <= now) {
      console.log(
        `Campaign ${campaignId} start date has passed, executing immediately`
      );
      await AdCampaignRepository.updateStatus(campaignId, "running");
      await this.executeDelivery(campaignId);
      await this.scheduleEndJob(campaignId, campaign.endDate);
    } else {
      // Schedule normally for future campaigns
      await this.scheduleCampaign(campaignId);
    }
  }

  private static async executeDelivery(campaignId: number): Promise<void> {
    const campaign = await AdCampaignRepository.findById(campaignId);
    if (!campaign) {
      console.log(`Campaign ${campaignId} not found`);
      return;
    }

    const ad = await AdvertisementRepository.findById(campaign.advertisementId);
    if (!ad) {
      console.log(
        `Advertisement ${campaign.advertisementId} not found for campaign ${campaignId}`
      );
      return;
    }

    console.log(`Executing delivery for campaign ${campaignId}: ${ad.title}`);

    const learners = await LearnerRepository.findAllActiveUsers();
    console.log(`Found ${learners.length} active users`);

    if (learners.length === 0) {
      console.log(`No active users found for campaign ${campaignId}`);
      return;
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const learner of learners) {
      if (!learner.email) {
        console.log(`User ${learner.id} has no email address`);
        continue;
      }

      // Check if email already sent to this user for this campaign
      const existingLog = await EmailLogRepository.findByCampaignAndUser(
        campaignId,
        learner.id!
      );
      if (existingLog) {
        console.log(
          `Email already sent to ${learner.email} for campaign ${campaignId}`
        );
        continue;
      }

      try {
        console.log(`Sending email to ${learner.email}...`);
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: learner.email,
          subject: ad.title,
          html: ad.htmlContent,
        });

        // Log successful send
        await EmailLogRepository.createLog({
          campaignId,
          userId: learner.id!,
          email: learner.email,
          status: "sent",
        });
        sentCount++;
        console.log(`Email sent successfully to ${learner.email}`);
      } catch (e) {
        // Log failed send
        await EmailLogRepository.createLog({
          campaignId,
          userId: learner.id!,
          email: learner.email,
          status: "failed",
          errorMessage: e instanceof Error ? e.message : "Unknown error",
        });
        failedCount++;
        console.error("Send ad mail error", learner.email, e);
      }
    }

    console.log(
      `Campaign ${campaignId} delivery completed: ${sentCount} sent, ${failedCount} failed`
    );
  }
}
