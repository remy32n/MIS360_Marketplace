import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/errors.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    sendError(res, 403, "Access denied. Admin role required.");
    return;
  }
  next();
}
