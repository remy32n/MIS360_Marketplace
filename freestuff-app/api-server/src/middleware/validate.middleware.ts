import type { Request, Response, NextFunction } from "express";

const LISTING_ALLOWLIST = [
  "title",
  "description",
  "posterImageUrl",
  "buildingName",
  "roomOrFloor",
  "category",
  "startTime",
  "endTime",
];

const URL_REGEX = /^https?:\/\/.+/;

export function validateListingBody(req: Request, res: Response, next: NextFunction): void {
  const filtered: Record<string, unknown> = {};
  for (const key of LISTING_ALLOWLIST) {
    if (req.body[key] !== undefined) {
      filtered[key] = req.body[key];
    }
  }

  if (filtered.posterImageUrl && !URL_REGEX.test(filtered.posterImageUrl as string)) {
    res.status(400).json({ error: "Please enter a valid URL starting with https://" });
    return;
  }

  req.body = filtered;
  next();
}
