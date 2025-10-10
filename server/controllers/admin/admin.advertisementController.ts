import { Request, Response } from "express";
import { AdvertisementRepository } from "../../repositories/admin/admin.advertisementRepository";

export class AdvertisementController {
  static async create(req: Request, res: Response) {
    try {
      const { title, htmlContent, imageUrl, targetUrl } = req.body;
      if (!title || !htmlContent) {
        return res.status(400).json({
          success: false,
          message: "title và htmlContent là bắt buộc",
        });
      }
      const id = await AdvertisementRepository.create({
        title,
        htmlContent,
        imageUrl: imageUrl || null,
        targetUrl: targetUrl || null,
      });
      return res.status(201).json({ success: true, data: { id } });
    } catch (e) {
      console.error("Create advertisement error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const ads = await AdvertisementRepository.findAll();
      return res.json({ success: true, data: ads });
    } catch (e) {
      console.error("List advertisements error", e);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, htmlContent, imageUrl, targetUrl } = req.body;

      if (!title || !htmlContent) {
        return res.status(400).json({
          success: false,
          message: "title and htmlContent are required",
        });
      }

      const ad = await AdvertisementRepository.findById(Number(id));
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: "Advertisement not found",
        });
      }

      await AdvertisementRepository.update(Number(id), {
        title,
        htmlContent,
        imageUrl: imageUrl || null,
        targetUrl: targetUrl || null,
      });

      return res.status(200).json({
        success: true,
        message: "Advertisement updated successfully",
      });
    } catch (e) {
      console.error("Update advertisement error", e);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const ad = await AdvertisementRepository.findById(Number(id));
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: "Advertisement not found",
        });
      }

      await AdvertisementRepository.delete(Number(id));

      return res.status(200).json({
        success: true,
        message: "Advertisement deleted successfully",
      });
    } catch (e) {
      console.error("Delete advertisement error", e);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
