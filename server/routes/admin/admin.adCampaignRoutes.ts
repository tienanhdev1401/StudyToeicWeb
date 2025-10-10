import { Router } from "express";
import { AdCampaignController } from "../../controllers/admin/admin.adCampaignController";

const router = Router();

router.post("/", AdCampaignController.create);
router.get("/", AdCampaignController.list);
router.put("/:id", AdCampaignController.update);
router.delete("/:id", AdCampaignController.cancel);
router.post("/:id/pause", AdCampaignController.pause);
router.post("/:id/resume", AdCampaignController.resume);
router.post("/trigger-overdue", AdCampaignController.triggerOverdue);
router.post("/trigger-running", AdCampaignController.triggerRunning);

export default router;
