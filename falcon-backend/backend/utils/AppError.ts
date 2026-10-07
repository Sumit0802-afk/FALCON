export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  /** Stable machine-readable identifier clients can branch on (e.g. "OTP_EXPIRED") */
  public readonly code?: string;
  /** Extra non-sensitive fields merged into the JSON error response */
  public readonly details?: Record<string, number | string | boolean>;

  constructor(
    message: string,
    statusCode = 400,
    code?: string,
    details?: Record<string, number | string | boolean>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }
  static notFound(message = "Not found") {
    return new AppError(message, 404);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
  static internalError(message = "Internal server error") {
    return new AppError(message, 500);
  }
}
