import { ApiError, toApiError } from "@/app/api/_helper/errors";

type SuccessPayload<T> = {
  success: true;
  data: T;
  requestId: string;
  meta?: Record<string, unknown>;
};

type ErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};

export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function ok<T>(request: Request, data: T, meta?: Record<string, unknown>): Response {
  const payload: SuccessPayload<T> = {
    success: true,
    data,
    requestId: getRequestId(request),
    ...(meta ? { meta } : {}),
  };

  return Response.json(payload, { status: 200 });
}

export function created<T>(request: Request, data: T): Response {
  const payload: SuccessPayload<T> = {
    success: true,
    data,
    requestId: getRequestId(request),
  };

  return Response.json(payload, { status: 201 });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function errorResponse(request: Request, error: unknown): Response {
  const mapped = toApiError(error);
  const requestId = getRequestId(request);
  const payload: ErrorPayload = {
    success: false,
    error: {
      code: mapped.code,
      message: mapped.status >= 500 ? "Internal server error" : mapped.message,
      ...(mapped.details !== undefined ? { details: mapped.details } : {}),
    },
    requestId,
  };

  return Response.json(payload, { status: mapped.status });
}

export function assert(condition: unknown, error: ApiError): asserts condition {
  if (!condition) {
    throw error;
  }
}

