import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function toApiError(value: unknown): ApiError {
  if (value instanceof ApiError) {
    return value;
  }

  if (value instanceof ZodError) {
    return new ApiError(422, "VALIDATION_ERROR", "Request validation failed", {
      issues: value.issues,
    });
  }

  const message = value instanceof Error ? value.message : "Unexpected server error";
  return new ApiError(500, "INTERNAL_ERROR", message);
}

