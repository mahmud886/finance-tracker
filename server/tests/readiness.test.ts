import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import type { AppConfig } from '../src/config';
import { AppLifecycle } from '../src/lifecycle';

describe('readiness lifecycle', () => {
  let app: Awaited<ReturnType<typeof createApp>>['app'];
  let lifecycle: AppLifecycle;
  let tempPath = '';

  beforeAll(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'finance-tracker-readiness-'));
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

    lifecycle = new AppLifecycle();
    ({ app } = await createApp({ config, lifecycle }));
  });

  afterAll(async () => {
    if (tempPath) {
      await rm(tempPath, { recursive: true, force: true });
    }
  });

  it('returns ready while running', async () => {
    const response = await request(app).get('/api/v1/ready');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ready');
  });

  it('returns not ready after shutdown flag', async () => {
    lifecycle.markShuttingDown();

    const response = await request(app).get('/api/v1/ready');
    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_READY');
  });
});

