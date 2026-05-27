import type { Request, Response } from "express";
import { sendError, sendServerError } from "../../utils/errors.js";
import { engagementService } from "./engagement.service.js";

export const engagementController = {
  async getSaved(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const savedListings = await engagementService.getSavedListings(user.userId);
      res.json({ savedListings });
    } catch (err) {
      sendServerError(res, "engagement.getSaved", err);
    }
  },

  async saveListing(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (user.role !== "STUDENT") {
        sendError(res, 403, "Only students can save listings."); return;
      }
      const { listingId } = req.body;
      if (!listingId) { sendError(res, 400, "Listing ID is required."); return; }

      const result = await engagementService.saveListing(user.userId, listingId);
      if ("error" in result) {
        sendError(res, result.status as number, result.error as string); return;
      }

      res.status(201).json({ message: "Listing saved.", savedId: result.savedId });
    } catch (err) {
      sendServerError(res, "engagement.saveListing", err);
    }
  },

  async unsaveListing(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const savedId = String(req.params["savedId"] ?? "");

      const result = await engagementService.unsaveListing(savedId, user.userId);
      if ("error" in result) {
        sendError(res, result.status as number, result.error as string); return;
      }

      res.json(result);
    } catch (err) {
      sendServerError(res, "engagement.unsaveListing", err);
    }
  },

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const unread = req.query["unread"] === "true";
      const result = await engagementService.getNotifications(user.userId, unread);
      res.json(result);
    } catch (err) {
      sendServerError(res, "engagement.getNotifications", err);
    }
  },

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const id = String(req.params["id"] ?? "");

      const result = await engagementService.markRead(id, user.userId);
      if ("error" in result) {
        sendError(res, result.status as number, result.error as string); return;
      }

      res.json(result);
    } catch (err) {
      sendServerError(res, "engagement.markRead", err);
    }
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const result = await engagementService.markAllRead(user.userId);
      res.json(result);
    } catch (err) {
      sendServerError(res, "engagement.markAllRead", err);
    }
  },

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await engagementService.getStats();
      res.json(stats);
    } catch (err) {
      sendServerError(res, "engagement.getStats", err);
    }
  },
};
