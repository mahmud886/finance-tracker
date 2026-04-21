import { z } from 'zod';
import type { RequestHandler } from 'express';
import {
  loanCreateSchema,
  loanListSchema,
  loanPaymentCreateSchema,
  loanPaymentListSchema,
  loanPaymentUpdateSchema,
  loanUpdateSchema,
} from '../domain';
import { asyncHandler, sendEmpty, sendSuccess, unauthorized } from '../http';
import { parseBody, parseParams, parseQuery } from '../validation';
import { LoansService } from '../services/loans.service';

const idParamSchema = z.object({ id: z.string().uuid() });

export class LoansController {
  constructor(private readonly service: LoansService) {}

  list: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, loanListSchema);
    const data = await this.service.list(req.auth.userId, query);
    sendSuccess(res, data);
  });

  create: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, loanCreateSchema);
    const data = await this.service.create(req.auth.userId, input);
    sendSuccess(res, data, 201);
  });

  get: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.get(req.auth.userId, id);
    sendSuccess(res, data);
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, loanUpdateSchema);
    const data = await this.service.update(req.auth.userId, id, patch);
    sendSuccess(res, data);
  });

  remove: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    await this.service.remove(req.auth.userId, id);
    sendEmpty(res);
  });

  listPayments: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, loanPaymentListSchema);
    const data = await this.service.listPayments(req.auth.userId, query);
    sendSuccess(res, data);
  });

  createPayment: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, loanPaymentCreateSchema);
    const data = await this.service.createPayment(req.auth.userId, input);
    sendSuccess(res, data, 201);
  });

  getPayment: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.getPayment(req.auth.userId, id);
    sendSuccess(res, data);
  });

  updatePayment: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, loanPaymentUpdateSchema);
    const data = await this.service.updatePayment(req.auth.userId, id, patch);
    sendSuccess(res, data);
  });

  removePayment: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    await this.service.removePayment(req.auth.userId, id);
    sendEmpty(res);
  });
}

