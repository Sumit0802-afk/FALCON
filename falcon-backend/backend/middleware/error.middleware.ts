import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const retryAfter = err.details?.retryAfterSeconds;
    if (typeof retryAfter === "number") {
      res.setHeader("Retry-After", String(retryAfter));
    }
    return res.status(err.statusCode).json({
      ...err.details,
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with these details already exists" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
  }

  // A body the JSON reader refused: too large, or not JSON. The client's mistake, not the server's
  const parse = err as { type?: string };
  if (parse?.type === "entity.too.large") {
    return res.status(413).json({ error: "That request is too large.", code: "PAYLOAD_TOO_LARGE" });
  }
  if (parse?.type === "entity.parse.failed" || parse?.type === "encoding.unsupported" || parse?.type === "charset.unsupported") {
    return res.status(400).json({ error: "The request could not be read.", code: "BAD_BODY" });
  }

  // eslint-disable-next-line no-console
  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
