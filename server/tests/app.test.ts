import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import type { AppConfig } from '../src/config';

describe('finance tracker api', () => {
  let app: Awaited<ReturnType<typeof createApp>>['app'];
  let token = '';
  let tempPath = '';

  beforeAll(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'finance-tracker-api-'));
    tempPath = tempDir;

    const config: AppConfig = {
      PORT: 0,
      NODE_ENV: 'test',
      AUTH_PROVIDER: 'local',
      JWT_SECRET: '12345678901234567890123456789012',
      JWT_EXPIRES_IN: '7d',
      DATA_FILE: join(tempDir, 'data.json'),
      CORS_ORIGIN: undefined,
      COOKIE_NAME: 'ft_token',
      RATE_LIMIT_WINDOW_MS: 60_000,
      RATE_LIMIT_MAX: 1000,
      RESET_TOKEN_TTL_MINUTES: 15,
      PUBLIC_API_URL: 'http://localhost:4000',
      apiBasePath: '/api/v1',
      docsPath: '/api-docs',
      openApiPath: '/api/v1/openapi.json',
      apiTitle: 'Finance Tracker API',
    };

    ({ app } = await createApp({ config }));
  });

  afterAll(async () => {
    if (tempPath) {
      await rm(tempPath, { recursive: true, force: true });
    }
  });

  it('returns health payload', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('supports signup and protected route access', async () => {
    const signup = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'super-secret-123',
        name: 'Test User',
        currency: 'USD',
      });

    expect(signup.status).toBe(201);
    expect(signup.body.success).toBe(true);
    token = signup.body.data.token as string;
    expect(token.length).toBeGreaterThan(10);

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('test@example.com');
  });

  it('rejects protected routes without token', async () => {
    const response = await request(app).get('/api/v1/categories');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('validates payloads', async () => {
    const response = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns conflict for duplicate category names', async () => {
    const first = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Utilities', icon: 'bolt', color: '#123abc' });

    expect(first.status).toBe(201);

    const duplicate = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Utilities', icon: 'flash', color: '#1f2937' });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('CATEGORY_EXISTS');
  });
});

