import type { RequestHandler } from 'express';
import { reportSummarySchema } from '../domain';
import { asyncHandler, sendSuccess, unauthorized } from '../http';
import { parseQuery } from '../validation';
import { ReportsService } from '../services/reports.service';

export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  dashboard: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const data = await this.service.dashboard(req.auth.userId);
    sendSuccess(res, data);
  });

  summary: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const query = parseQuery(req, reportSummarySchema);
    const data = await this.service.summary(req.auth.userId, query);
    sendSuccess(res, data);
  });
}

