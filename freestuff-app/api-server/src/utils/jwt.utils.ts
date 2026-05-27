import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["SESSION_SECRET"] || process.env["JWT_SECRET"] || "freestuff_dev_secret_min_32_chars_long";
const JWT_EXPIRY = "1h";

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  orgId: string | null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
