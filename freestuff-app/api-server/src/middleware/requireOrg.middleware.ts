import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/errors.js";
import prisma from "../lib/prisma.js";

export async function requireOrg(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = (req as any).user;
  if (!user || (user.role !== "ORG" && user.role !== "ADMIN")) {
    sendError(res, 403, "Access denied. Organization role required.");
    return;
  }

  if (user.role === "ADMIN") {
    next();
    return;
  }

  if (!user.orgId) {
    sendError(res, 403, "Your organization account is pending verification.");
    return;
  }

  const org = await prisma.studentOrg.findUnique({ where: { id: user.orgId } });
  if (!org) {
    sendError(res, 403, "Organization not found.");
    return;
  }

  if (org.verificationStatus === "PENDING" || org.verificationStatus === "REJECTED") {
    sendError(res, 403, "Your organization account is pending verification.");
    return;
  }

  next();
}
