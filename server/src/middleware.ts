import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { extractBearerToken, verifyAccessToken } from './auth';
import type { AppContext } from './types';
import { unauthorized } from './http';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const headerId = req.header('x-request-id');
  const id = headerId && headerId.trim().length > 0 ? headerId : randomUUID();
  res.locals.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}

export function requireAuth(context: AppContext) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractBearerToken(req, context.config.COOKIE_NAME);
      if (!token) {
        throw unauthorized('Missing access token');
      }


      if (!context.config.JWT_SECRET) {
        throw unauthorized('JWT auth is not configured');
      }

      const payload = verifyAccessToken(token, context.config.JWT_SECRET);
      const isRevoked = await context.store.isTokenRevoked(payload.jti);
      if (isRevoked) {
        throw unauthorized('Access token is revoked');
      }

      req.auth = {
        userId: payload.sub,
        email: payload.email,
        jti: payload.jti,
      };
      next();
    } catch (error) {
      next(error instanceof Error ? error : unauthorized('Invalid or expired access token'));
    }
  };
}

