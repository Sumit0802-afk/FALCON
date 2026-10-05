import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET ?? "falcon_super_secret_jwt_key_change_in_production_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export interface TokenPayload {
  userId: string;
  role: string;
  sessionId?: string;
  type?: "session" | "mfa";
}

export interface MfaTokenPayload {
  userId: string;
  email: string;
  type: "mfa";
}

export const tokenService = {
  sign(payload: TokenPayload, expiresIn: string | number = JWT_EXPIRES_IN): string {
    return jwt.sign({ ...payload, type: payload.type || "session" }, JWT_SECRET, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  },

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (decoded.type && decoded.type !== "session") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch {
      throw AppError.unauthorized("Invalid or expired authentication session");
    }
  },

  signMfa(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: "mfa" },
      JWT_SECRET,
      { expiresIn: "10m" }
    );
  },

  verifyMfa(token: string): MfaTokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as MfaTokenPayload;
      if (decoded.type !== "mfa") {
        throw new Error("Invalid MFA token type");
      }
      return decoded;
    } catch {
      throw AppError.unauthorized("Invalid or expired verification session. Please sign in again.");
    }
  },
};
