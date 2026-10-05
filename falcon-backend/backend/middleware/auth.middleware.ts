import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { authService } from "../services/auth.service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      sessionToken?: string;
    }
  }
}

export function extractAuthToken(req: Request): string | null {
  // 1. Check HttpOnly cookie first
  if (req.cookies?.falcon_session) {
    return req.cookies.falcon_session;
  }

  // 2. Check Authorization Bearer header
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  return null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractAuthToken(req);

    if (!token) {
      return next(AppError.unauthorized("Authentication required. Please sign in."));
    }

    const sessionData = await authService.validateSession(token);
    req.userId = sessionData.userId;
    req.userRole = sessionData.role;
    req.sessionToken = token;

    next();
  } catch (error) {
    next(error);
  }
}

/** Role-based access control guard. Must be used after requireAuth. */
export function requireRole(role: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return next(AppError.forbidden("You do not have permission to access this resource"));
    }
    next();
  };
}
