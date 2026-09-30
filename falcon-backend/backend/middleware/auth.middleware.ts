import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { tokenService } from "../services/token.service";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed Authorization header"));
  }

  const token = header.slice("Bearer ".length);
  const payload = tokenService.verify(token);
  req.userId = payload.userId;
  req.userRole = payload.role;
  next();
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
