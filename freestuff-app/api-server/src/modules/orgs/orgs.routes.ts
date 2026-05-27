import { Router } from "express";
import { orgsController } from "./orgs.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/requireAdmin.middleware.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, orgsController.getAll);
router.patch("/:id/verify", requireAuth, requireAdmin, orgsController.updateVerification);

export default router;
