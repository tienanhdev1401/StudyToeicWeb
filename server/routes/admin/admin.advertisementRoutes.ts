import { Router } from "express";
import { AdvertisementController } from "../../controllers/admin/admin.advertisementController";

const router = Router();

router.post("/", AdvertisementController.create);
router.get("/", AdvertisementController.list);
router.put("/:id", AdvertisementController.update);
router.delete("/:id", AdvertisementController.delete);

export default router;
