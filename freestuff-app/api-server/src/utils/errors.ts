import type { Response } from "express";

export function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ error: message });
}

export function sendServerError(res: Response, context: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[${context}] error:`, msg);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
