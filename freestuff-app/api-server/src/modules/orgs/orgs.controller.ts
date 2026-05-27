import type { Request, Response } from "express";
import { orgsService } from "./orgs.service.js";
import { sendError, sendServerError } from "../../utils/errors.js";

const VALID_STATUSES = ["VERIFIED", "REJECTED", "PENDING"];

export const orgsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const orgs = await orgsService.getAllOrgs();
      res.json({ orgs });
    } catch (err) {
      sendServerError(res, "orgs.getAll", err);
    }
  },

  async updateVerification(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params["id"] ?? "");
      const { status } = req.body;

      if (!VALID_STATUSES.includes(status)) {
        sendError(res, 400, `Status must be one of: ${VALID_STATUSES.join(", ")}.`);
        return;
      }

      const org = await orgsService.getOrgById(id);
      if (!org) {
        sendError(res, 404, "Organization not found.");
        return;
      }

      const updated = await orgsService.updateOrgVerificationStatus(id, status);
      res.json({ org: updated, message: `Organization ${status.toLowerCase()}.` });
    } catch (err) {
      sendServerError(res, "orgs.updateVerification", err);
    }
  },
};
