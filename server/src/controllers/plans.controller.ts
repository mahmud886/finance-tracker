import { z } from 'zod';
import type { RequestHandler } from 'express';
import {
  planItemCreateSchema,
  planItemListSchema,
  planItemUpdateSchema,
  templateCreateSchema,
  templateListSchema,
  templateUpdateSchema,
  togglePurchasedSchema,
} from '../domain';
import { asyncHandler, sendEmpty, sendSuccess, unauthorized } from '../http';
import { parseBody, parseParams, parseQuery } from '../validation';
import { PlansService } from '../services/plans.service';

const idParamSchema = z.object({ id: z.string().uuid() });

export class PlansController {
  constructor(private readonly service: PlansService) {}

  listTemplates: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, templateListSchema);
    const data = await this.service.listTemplates(req.auth.userId, query);
    sendSuccess(res, data);
  });

  createTemplate: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, templateCreateSchema);
    const data = await this.service.createTemplate(req.auth.userId, input);
    sendSuccess(res, data, 201);
  });

  getTemplate: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.getTemplate(req.auth.userId, id);
    sendSuccess(res, data);
  });

  updateTemplate: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, templateUpdateSchema);
    const data = await this.service.updateTemplate(req.auth.userId, id, patch);
    sendSuccess(res, data);
  });

  deleteTemplate: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    await this.service.deleteTemplate(req.auth.userId, id);
    sendEmpty(res);
  });

  listItems: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, planItemListSchema);
    const data = await this.service.listItems(req.auth.userId, query);
    sendSuccess(res, data);
  });

  createItem: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const input = parseBody(req, planItemCreateSchema);
    const data = await this.service.createItem(req.auth.userId, input);
    sendSuccess(res, data, 201);
  });

  getItem: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const data = await this.service.getItem(req.auth.userId, id);
    sendSuccess(res, data);
  });

  updateItem: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const patch = parseBody(req, planItemUpdateSchema);
    const data = await this.service.updateItem(req.auth.userId, id, patch);
    sendSuccess(res, data);
  });

  deleteItem: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    await this.service.deleteItem(req.auth.userId, id);
    sendEmpty(res);
  });

  togglePurchased: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const { id } = parseParams(req, idParamSchema);
    const input = parseBody(req, togglePurchasedSchema);
    const data = await this.service.togglePurchased(req.auth.userId, id, input);
    sendSuccess(res, data);
  });
}

