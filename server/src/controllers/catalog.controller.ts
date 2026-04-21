import { z } from 'zod';
import type { RequestHandler } from 'express';
import {
  catalogCreateSchema,
  catalogListSchema,
  catalogUpdateSchema,
} from '../domain';
import { asyncHandler, sendEmpty, sendSuccess, unauthorized } from '../http';
import { parseBody, parseParams, parseQuery } from '../validation';
import { CatalogService } from '../services/catalog.service';

const idParamSchema = z.object({ id: z.string().uuid() });

export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  list: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, catalogListSchema);
    const data = await this.service.list(query);
    sendSuccess(res, data, 200, { limit: query.limit, offset: query.offset });
  });

  create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, catalogCreateSchema);
    const data = await this.service.create(input);
    sendSuccess(res, data, 201);
  });

  get: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.get(id);
    sendSuccess(res, data);
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, catalogUpdateSchema);
    const data = await this.service.update(id, patch);
    sendSuccess(res, data);
  });

  remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    await this.service.remove(id);
    sendEmpty(res);
  });
}

