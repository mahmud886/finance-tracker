import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";

const MAX_JSON_BODY_BYTES = 1_000_000;

export async function parseJsonBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Expected application/json body");
  }

  const raw = await request.text();
  if (raw.length > MAX_JSON_BODY_BYTES) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "JSON body is too large");
  }

  let body: unknown = {};
  if (raw.length > 0) {
    try {
      body = JSON.parse(raw);
    } catch {
      throw new ApiError(400, "INVALID_JSON", "Malformed JSON payload");
    }
  }
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(422, "VALIDATION_ERROR", "Request validation failed", {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}

export function parseQuery<T extends z.ZodTypeAny>(request: Request, schema: T): z.infer<T> {
  const url = new URL(request.url);
  const data: Record<string, string | string[]> = {};

  url.searchParams.forEach((value, key) => {
    if (key in data) {
      const existing = data[key];
      data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      return;
    }

    data[key] = value;
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(422, "VALIDATION_ERROR", "Query validation failed", {
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}


