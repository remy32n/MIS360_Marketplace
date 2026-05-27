import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { signToken } from "../../utils/jwt.utils.js";
import { sendError, sendServerError } from "../../utils/errors.js";
import { identityService } from "./identity.service.js";

export const identityController = {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, accountType, orgName, orgType, contactEmail } = req.body;

      if (!email || !email.endsWith("@depaul.edu")) {
        sendError(res, 400, "Only @depaul.edu email addresses are permitted.");
        return;
      }
      if (!password || password.length < 8) {
        sendError(res, 400, "Password must be at least 8 characters.");
        return;
      }
      if (!accountType || !["STUDENT", "ORG"].includes(accountType)) {
        sendError(res, 400, "Account type must be STUDENT or ORG.");
        return;
      }
      if (accountType === "ORG" && (!orgName || !orgType || !contactEmail)) {
        sendError(res, 400, "Organization name, type, and contact email are required for org accounts.");
        return;
      }

      const existing = await identityService.getUserByEmail(email);
      if (existing) {
        sendError(res, 409, "An account with this email already exists.");
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, passwordHash, firstName, lastName, role: accountType as "STUDENT" | "ORG" | "ADMIN" },
      });

      if (accountType === "ORG") {
        const org = await prisma.studentOrg.create({
          data: { orgName, orgType, contactEmail, verificationStatus: "PENDING" },
        });
        await prisma.orgMembership.create({
          data: { userId: user.id, orgId: org.id, roleInOrg: "owner" },
        });
      }

      res.status(201).json({ message: "Account created. Please log in." });
    } catch (err) {
      sendServerError(res, "identity.signup", err);
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        sendError(res, 400, "Email and password are required.");
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { orgMemberships: { include: { org: true }, take: 1 } },
      });

      if (!user) {
        sendError(res, 401, "Invalid email or password.");
        return;
      }
      if (!user.isActive) {
        sendError(res, 403, "This account has been deactivated.");
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        sendError(res, 401, "Invalid email or password.");
        return;
      }

      const orgMembership = user.orgMemberships[0] || null;
      const orgId = orgMembership?.orgId || null;

      const token = signToken({ userId: user.id, role: user.role, email: user.email, orgId });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "lax",
        maxAge: 3600 * 1000,
      });

      res.json({
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        org: orgMembership ? {
          id: orgMembership.org.id,
          orgName: orgMembership.org.orgName,
          orgType: orgMembership.org.orgType,
          verificationStatus: orgMembership.org.verificationStatus,
        } : null,
      });
    } catch (err) {
      sendServerError(res, "identity.login", err);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out." });
  },

  async me(req: Request, res: Response): Promise<void> {
    try {
      const payload = (req as any).user;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { orgMemberships: { include: { org: true }, take: 1 } },
      });

      if (!user) {
        sendError(res, 404, "User not found.");
        return;
      }

      const orgMembership = user.orgMemberships[0] || null;

      res.json({
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        org: orgMembership ? {
          id: orgMembership.org.id,
          orgName: orgMembership.org.orgName,
          orgType: orgMembership.org.orgType,
          verificationStatus: orgMembership.org.verificationStatus,
        } : null,
      });
    } catch (err) {
      sendServerError(res, "identity.me", err);
    }
  },

  async verifyOrgStatus(req: Request, res: Response): Promise<void> {
    try {
      const orgId = String(req.params["orgId"] ?? "");
      const org = await identityService.verifyOrgStatus(orgId);
      if (!org) {
        sendError(res, 404, "Organization not found.");
        return;
      }
      res.json(org);
    } catch (err) {
      sendServerError(res, "identity.verifyOrgStatus", err);
    }
  },
};
