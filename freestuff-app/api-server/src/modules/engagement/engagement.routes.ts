import { Router } from "express";
import { engagementController } from "./engagement.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/requireAdmin.middleware.js";

const router = Router();

router.get("/saved", requireAuth, engagementController.getSaved);
router.post("/saved", requireAuth, engagementController.saveListing);
router.delete("/saved/:savedId", requireAuth, engagementController.unsaveListing);
router.get("/notifications", requireAuth, engagementController.getNotifications);
router.patch("/notifications/read-all", requireAuth, engagementController.markAllRead);
router.patch("/notifications/:id/read", requireAuth, engagementController.markRead);
router.get("/stats", requireAuth, requireAdmin, engagementController.getStats);

export default router;
