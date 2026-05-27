import type { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { sendError, sendServerError } from "../../utils/errors.js";
import { listingsService } from "./listings.service.js";
import { identityService } from "../identity/identity.service.js";

const VALID_CATEGORIES = ["FOOD", "DRINKS", "APPAREL", "SUPPLIES", "OTHER"];

const qstr = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;
const qnum = (v: unknown, fallback: number): number =>
  typeof v === "string" && !isNaN(parseInt(v)) ? parseInt(v) : fallback;

export const listingsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await listingsService.getActiveListings({
        category: qstr(req.query["category"]),
        building: qstr(req.query["building"]),
        search: qstr(req.query["search"]),
        page: qnum(req.query["page"], 1),
        limit: qnum(req.query["limit"], 12),
      });
      res.json(result);
    } catch (err) {
      sendServerError(res, "listings.getAll", err);
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const id = String(req.params["id"] ?? "");

      let listing;
      if (user.role === "ADMIN") {
        listing = await listingsService.getListingByIdAdmin(id);
      } else {
        listing = await listingsService.getListingById(id, false);
      }

      if (!listing) {
        sendError(res, 404, "Listing not found or no longer available.");
        return;
      }

      await listingsService.incrementViewCount(id);
      res.json(listing);
    } catch (err) {
      sendServerError(res, "listings.getById", err);
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime } = req.body;

      if (!title || title.length > 100) {
        sendError(res, 400, "Title is required and must be 100 characters or less.");
        return;
      }
      if (!description || description.length > 500) {
        sendError(res, 400, "Description is required and must be 500 characters or less.");
        return;
      }
      if (!buildingName) { sendError(res, 400, "Building name is required."); return; }
      if (!roomOrFloor) { sendError(res, 400, "Room or floor is required."); return; }
      if (!category || !VALID_CATEGORIES.includes(category)) {
        sendError(res, 400, "Category must be one of: FOOD, DRINKS, APPAREL, SUPPLIES, OTHER."); return;
      }
      if (!startTime) { sendError(res, 400, "Start time is required."); return; }
      if (!endTime) { sendError(res, 400, "End time is required."); return; }
      if (new Date(endTime) <= new Date(startTime)) {
        sendError(res, 400, "End time must be after start time."); return;
      }

      if (user.role !== "ADMIN") {
        const orgStatus = await identityService.verifyOrgStatus(user.orgId);
        if (!orgStatus || orgStatus.verificationStatus !== "VERIFIED") {
          sendError(res, 403, "Your organization must be verified before posting listings."); return;
        }
      }

      const listing = await listingsService.createListing({
        postedByUserId: user.userId,
        postedByOrgId: user.orgId,
        title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime,
      });

      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (admin) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            listingId: listing.id,
            notificationType: "NEW_LISTING",
            message: `New listing pending review: ${title}`,
            channel: "IN_APP",
          },
        });
      }

      res.status(201).json({ listing, message: "Listing submitted for admin review." });
    } catch (err) {
      sendServerError(res, "listings.create", err);
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const id = String(req.params["id"] ?? "");

      const listing = await listingsService.getListingByIdAdmin(id);
      if (!listing) { sendError(res, 404, "Listing not found."); return; }

      if (user.userId !== listing.postedByUserId && user.role !== "ADMIN") {
        sendError(res, 403, "You can only edit your own listings."); return;
      }

      const { title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime } = req.body;
      const updated = await listingsService.updateListing(id, {
        title, description, posterImageUrl, buildingName, roomOrFloor, category, startTime, endTime,
      });

      res.json(updated);
    } catch (err) {
      sendServerError(res, "listings.update", err);
    }
  },

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const id = String(req.params["id"] ?? "");

      const listing = await listingsService.getListingByIdAdmin(id);
      if (!listing) { sendError(res, 404, "Listing not found."); return; }

      if (user.userId !== listing.postedByUserId && user.role !== "ADMIN") {
        sendError(res, 403, "You can only remove your own listings."); return;
      }

      await listingsService.updateListingStatus(id, "REMOVED");
      res.json({ message: "Listing removed." });
    } catch (err) {
      sendServerError(res, "listings.remove", err);
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params["id"] ?? "");
      const { status, reason } = req.body;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        sendError(res, 400, "Status must be APPROVED or REJECTED."); return;
      }

      const listing = await listingsService.getListingByIdAdmin(id);
      if (!listing) { sendError(res, 404, "Listing not found."); return; }

      const finalStatus = status === "APPROVED" ? "ACTIVE" : "REJECTED";
      const updated = await listingsService.updateListingStatus(id, finalStatus);

      if (status === "APPROVED") {
        await prisma.notification.create({
          data: {
            userId: listing.postedByUserId,
            listingId: listing.id,
            notificationType: "LISTING_APPROVED",
            message: `Your listing '${listing.title}' has been approved and is now live.`,
            channel: "IN_APP",
          },
        });

        const students = await prisma.user.findMany({ where: { role: "STUDENT", isActive: true } });
        await prisma.notification.createMany({
          data: students.map(s => ({
            userId: s.id,
            listingId: listing.id,
            notificationType: "NEW_LISTING" as any,
            message: `New free items available: ${listing.title} at ${listing.buildingName}`,
            channel: "IN_APP" as any,
          })),
        });

        res.json({ listing: updated, message: "Listing approved." });
      } else {
        const rejectReason = reason || "Does not meet platform guidelines";
        await prisma.notification.create({
          data: {
            userId: listing.postedByUserId,
            listingId: listing.id,
            notificationType: "LISTING_REJECTED",
            message: `Your listing '${listing.title}' was not approved. Reason: ${rejectReason}`,
            channel: "IN_APP",
          },
        });
        res.json({ listing: updated, message: "Listing rejected." });
      }
    } catch (err) {
      sendServerError(res, "listings.updateStatus", err);
    }
  },

  async getPending(req: Request, res: Response): Promise<void> {
    try {
      const listings = await listingsService.getPendingListings();
      res.json({ listings });
    } catch (err) {
      sendServerError(res, "listings.getPending", err);
    }
  },

  async getAllAdmin(req: Request, res: Response): Promise<void> {
    try {
      const result = await listingsService.getAllListingsAdmin({
        status: qstr(req.query["status"]),
        page: qnum(req.query["page"], 1),
        limit: qnum(req.query["limit"], 20),
      });
      res.json(result);
    } catch (err) {
      sendServerError(res, "listings.getAllAdmin", err);
    }
  },

  async getMine(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user.orgId) {
        sendError(res, 403, "Only org accounts can access their listings.");
        return;
      }
      const listings = await listingsService.getMineListings(user.orgId);
      res.json({ listings });
    } catch (err) {
      sendServerError(res, "listings.getMine", err);
    }
  },
};
