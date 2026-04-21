import { z } from 'zod';
import type { RequestHandler } from 'express';
import {
  categoryCreateSchema,
  categoryListSchema,
  categoryUpdateSchema,
} from '../domain';
import { asyncHandler, sendEmpty, sendSuccess, unauthorized } from '../http';
import { parseBody, parseParams, parseQuery } from '../validation';
import { CategoriesService } from '../services/categories.service';

const idParamSchema = z.object({ id: z.string().uuid() });

export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  list: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, categoryListSchema);
    const result = await this.service.list(req.auth.userId, query.limit, query.offset);
    sendSuccess(res, result.data, 200, result.meta);
  });

  get: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.get(req.auth.userId, id);
    sendSuccess(res, data);
  });

  create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, categoryCreateSchema);
    const data = await this.service.create(req.auth.userId, input);
    sendSuccess(res, data, 201);
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, categoryUpdateSchema);
    const data = await this.service.update(req.auth.userId, id, patch);
    sendSuccess(res, data);
  });

  remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    await this.service.remove(req.auth.userId, id);
    sendEmpty(res);
  });
}

