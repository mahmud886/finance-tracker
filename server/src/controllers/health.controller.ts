import type { RequestHandler } from 'express';
import { asyncHandler, sendSuccess } from '../http';
import { HealthService } from '../services/health.service';

export class HealthController {
  constructor(private readonly service: HealthService) {}

  health: RequestHandler = (req, res) => {
    void req;
    sendSuccess(res, this.service.getHealth());
  };

  ready: RequestHandler = asyncHandler(async (req, res) => {
    void req;
    sendSuccess(res, this.service.getReadiness());
  });
}

