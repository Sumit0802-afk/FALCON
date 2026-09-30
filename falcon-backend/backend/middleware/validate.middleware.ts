import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

/** Validates req.body against a Zod schema and replaces it with the parsed (typed) result. */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        return next(AppError.badRequest(message));
      }
      next(err);
    }
  };
}
