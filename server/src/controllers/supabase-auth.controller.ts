import type { RequestHandler } from 'express';
import { setAuthCookie } from '../auth';
import { supabaseExchangeSchema } from '../domain';
import { asyncHandler, sendSuccess } from '../http';
import type { AppConfig } from '../config';
import { parseBody } from '../validation';
import type { AuthService } from '../services/auth.service';

export class SupabaseAuthController {
  private readonly authRuntime;

  constructor(
    private readonly service: AuthService,
    config: AppConfig,
  ) {
    if (!config.JWT_SECRET) {
      throw new Error('JWT_SECRET is required for issuing backend access tokens');
    }

    this.authRuntime = {
      jwtSecret: config.JWT_SECRET,
      jwtExpiresIn: config.JWT_EXPIRES_IN,
      cookieName: config.COOKIE_NAME,
    };
  }

  exchange: RequestHandler = asyncHandler(async (req, res) => {
    const input = parseBody(req, supabaseExchangeSchema);
    const data = await this.service.exchangeSupabaseToken(input);
    setAuthCookie(res, data.token, this.authRuntime);
    sendSuccess(res, data);
  });
}

