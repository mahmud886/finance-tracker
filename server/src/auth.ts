import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  jti: string;
}

export interface AuthRuntimeConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  cookieName: string;
}

export function createCookieParser() {
  return cookieParser();
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: { userId: string; email: string }, config: AuthRuntimeConfig) {
  const tokenPayload: AccessTokenPayload = {
    sub: payload.userId,
    email: payload.email,
    jti: crypto.randomUUID(),
  } as AccessTokenPayload;

  const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(tokenPayload, config.jwtSecret, options);
}

export function verifyAccessToken(token: string, jwtSecret: string) {
  return jwt.verify(token, jwtSecret) as AccessTokenPayload;
}

export function setAuthCookie(res: Response, token: string, config: AuthRuntimeConfig) {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: Response, config: AuthRuntimeConfig) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export function extractBearerToken(req: Request, cookieName: string) {
  const header = req.header('authorization');
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  const cookieToken = req.cookies?.[cookieName];
  return typeof cookieToken === 'string' && cookieToken.length > 0 ? cookieToken : null;
}

