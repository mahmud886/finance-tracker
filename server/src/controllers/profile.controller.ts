import type { RequestHandler } from 'express';
import { profileUpdateSchema } from '../domain';
import { asyncHandler, sendSuccess, unauthorized } from '../http';
import { parseBody } from '../validation';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  get: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const data = await this.service.get(req.auth.userId);
    sendSuccess(res, data);
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const patch = parseBody(req, profileUpdateSchema);
    const data = await this.service.update(req.auth.userId, patch);
    sendSuccess(res, data);
  });
}

