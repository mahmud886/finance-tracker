import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export type RequestWithId = Request & { requestId?: string };

export function createError(statusCode: number, code: string, message: string, details?: unknown) {
  return new ApiError(statusCode, code, message, details);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
    requestId: res.locals.requestId,
  });
}

export function sendEmpty(res: Response, statusCode = 204) {
  return res.status(statusCode).send();
}

export function sendError(res: Response, error: ApiError | Error, fallbackStatusCode = 500) {
  const apiError = error instanceof ApiError
    ? error
    : new ApiError(fallbackStatusCode, 'INTERNAL_SERVER_ERROR', error.message || 'Unexpected error');

  return res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
    },
    requestId: res.locals.requestId,
  });
}

export function notFound(message = 'Route not found') {
  return createError(404, 'NOT_FOUND', message);
}

export function unauthorized(message = 'Unauthorized') {
  return createError(401, 'UNAUTHORIZED', message);
}

export function forbidden(message = 'Forbidden') {
  return createError(403, 'FORBIDDEN', message);
}

export function validationError(details: unknown) {
  return createError(422, 'VALIDATION_ERROR', 'Request validation failed', details);
}

