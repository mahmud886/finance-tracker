import type { RequestHandler } from 'express';
import { clearAuthCookie, setAuthCookie } from '../auth';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../domain';
import { asyncHandler, sendSuccess, unauthorized } from '../http';
import type { AppConfig } from '../config';
import { parseBody } from '../validation';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private readonly authRuntime;

  constructor(
    private readonly service: AuthService,
    config: AppConfig,
  ) {
    if (!config.JWT_SECRET) {
      throw new Error('JWT_SECRET is required for local auth routes');
    }

    this.authRuntime = {
      jwtSecret: config.JWT_SECRET,
      jwtExpiresIn: config.JWT_EXPIRES_IN,
      cookieName: config.COOKIE_NAME,
    };
  }

  signup: RequestHandler = asyncHandler(async (req, res) => {
    const input = parseBody(req, signupSchema);
    const data = await this.service.signup(input);
    setAuthCookie(res, data.token, this.authRuntime);
    sendSuccess(res, data, 201);
  });

  login: RequestHandler = asyncHandler(async (req, res) => {
    const input = parseBody(req, loginSchema);
    const data = await this.service.login(input);
    setAuthCookie(res, data.token, this.authRuntime);
    sendSuccess(res, data);
  });

  logout: RequestHandler = asyncHandler(async (req, res) => {
    const data = await this.service.logout(req.auth?.jti);
    clearAuthCookie(res, this.authRuntime);
    sendSuccess(res, data);
  });

  forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    const input = parseBody(req, forgotPasswordSchema);
    const data = await this.service.forgotPassword(input);
    sendSuccess(res, data);
  });

  resetPassword: RequestHandler = asyncHandler(async (req, res) => {
    const input = parseBody(req, resetPasswordSchema);
    const data = await this.service.resetPassword(input);
    sendSuccess(res, data);
  });

  me: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.auth) throw unauthorized();
    const data = await this.service.me(req.auth.userId);
    sendSuccess(res, data);
  });
}

