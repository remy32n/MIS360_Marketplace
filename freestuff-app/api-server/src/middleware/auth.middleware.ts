import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils.js";
import prisma from "../lib/prisma.js";
import { sendError } from "../utils/errors.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      sendError(res, 401, "Authentication required.");
      return;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      sendError(res, 401, "User not found.");
      return;
    }

    if (!user.isActive) {
      sendError(res, 401, "This account has been deactivated.");
      return;
    }

    (req as any).user = payload;
    next();
  } catch {
    sendError(res, 401, "Invalid or expired token.");
  }
}
