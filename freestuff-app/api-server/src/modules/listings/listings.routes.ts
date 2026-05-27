import { Router } from "express";
import rateLimit from "express-rate-limit";
import { listingsController } from "./listings.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/requireAdmin.middleware.js";
import { requireOrg } from "../../middleware/requireOrg.middleware.js";
import { validateListingBody } from "../../middleware/validate.middleware.js";

const router = Router();

const listingsReadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const listingsCreateLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 5 });

router.get("/admin/pending", requireAuth, requireAdmin, listingsController.getPending);
router.get("/admin/all", requireAuth, requireAdmin, listingsController.getAllAdmin);
router.get("/mine", requireAuth, requireOrg, listingsController.getMine);
router.get("/", requireAuth, listingsReadLimiter, listingsController.getAll);
router.get("/:id", requireAuth, listingsController.getById);
router.post("/", requireAuth, requireOrg, listingsCreateLimiter, validateListingBody, listingsController.create);
router.put("/:id", requireAuth, validateListingBody, listingsController.update);
router.delete("/:id", requireAuth, listingsController.remove);
router.patch("/:id/status", requireAuth, requireAdmin, listingsController.updateStatus);

export default router;
