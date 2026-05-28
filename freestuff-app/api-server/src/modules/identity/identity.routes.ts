import { Router } from "express";
import rateLimit from "express-rate-limit";
import { identityController } from "./identity.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

const signupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/auth/signup", signupLimiter, identityController.signup);
router.post("/auth/login", loginLimiter, identityController.login);
router.post("/auth/logout", identityController.logout);
router.get("/auth/me", requireAuth, identityController.me);
router.get("/users/verifyOrgStatus/:orgId", requireAuth, identityController.verifyOrgStatus);
router.post("/auth/lookup-email", identityController.lookupEmail);
router.post("/auth/reset-password", identityController.resetPassword);

export default router;
