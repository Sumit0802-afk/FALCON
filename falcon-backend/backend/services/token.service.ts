import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

function resolveAuthSecret(): string {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in the backend environment");
  }

  // eslint-disable-next-line no-console
  console.warn("[token.service] JWT_SECRET is not set; using a temporary secret. Sessions reset on restart.");
  return crypto.randomBytes(48).toString("hex");
}

/** Server-side signing secret. Used for session JWTs and for keying OTP hashes. */
export const authSecret = resolveAuthSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export interface TokenPayload {
  userId: string;
  role: string;
  sessionId?: string;
  type?: "session";
}

export const tokenService = {
  sign(payload: TokenPayload, expiresIn: string | number = JWT_EXPIRES_IN): string {
    return jwt.sign({ ...payload, type: payload.type || "session" }, authSecret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  },

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, authSecret) as TokenPayload;
      if (decoded.type && decoded.type !== "session") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch {
      throw AppError.unauthorized("Invalid or expired authentication session");
    }
  },
};
