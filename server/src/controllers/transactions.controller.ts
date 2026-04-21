import { z } from 'zod';
import type { RequestHandler } from 'express';
import {
  transactionCreateSchema,
  transactionListSchema,
  transactionUpdateSchema,
} from '../domain';
import { asyncHandler, sendEmpty, sendSuccess, unauthorized } from '../http';
import { parseBody, parseParams, parseQuery } from '../validation';
import { TransactionsService } from '../services/transactions.service';

const idParamSchema = z.object({ id: z.string().uuid() });

export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  list: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, transactionListSchema);
    const data = await this.service.list(req.auth.userId, query);
    sendSuccess(res, data, 200, { limit: query.limit, offset: query.offset });
  });

  get: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.get(req.auth.userId, id);
    sendSuccess(res, data);
  });

  create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, transactionCreateSchema);
    const data = await this.service.create(req.auth.userId, input);
    sendSuccess(res, data, 201);
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, transactionUpdateSchema);
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

