import type { Request } from 'express';
import type { z } from 'zod';
import { validationError } from './http';

function parseSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw validationError(result.error.flatten());
  }
  return result.data;
}

export function parseBody<T>(req: Request, schema: z.ZodType<T>): T {
  return parseSchema(schema, req.body);
}

export function parseQuery<T>(req: Request, schema: z.ZodType<T>): T {
  return parseSchema(schema, req.query);
}

export function parseParams<T>(req: Request, schema: z.ZodType<T>): T {
  return parseSchema(schema, req.params);
}

