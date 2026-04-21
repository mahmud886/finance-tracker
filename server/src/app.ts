import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createCookieParser } from './auth';
import { loadConfig, type AppConfig } from './config';
import { sendError, notFound } from './http';
import { AppLifecycle } from './lifecycle';
import { requestId, requireAuth } from './middleware';
import { createOpenApiSpec } from './openapi';
import { createAuthRouter } from './routes/auth.routes';
import { createBudgetRouter } from './routes/budgets.routes';
import { createCatalogRouter } from './routes/catalog.routes';
import { createCategoryRouter } from './routes/categories.routes';
import { createHealthRouter } from './routes/health.routes';
import { createLoansRouter } from './routes/loans.routes';
import { createPlansRouter } from './routes/plans.routes';
import { createProfileRouter } from './routes/profile.routes';
import { createReportsRouter } from './routes/reports.routes';
import { createTransactionRouter } from './routes/transactions.routes';
import { createSupabaseAuthRouter } from './routes/supabase-auth.routes';
import { FinanceStore } from './store';
import type { AppContext } from './types';
import { createServiceContainer } from './di/container';

export interface CreateAppOptions {
  config?: AppConfig;
  store?: FinanceStore;
  lifecycle?: AppLifecycle;
}

export async function createApp(options: CreateAppOptions = {}) {
  const config = options.config ?? loadConfig();
  const store = options.store ?? await FinanceStore.create(config.DATA_FILE);
  const lifecycle = options.lifecycle ?? new AppLifecycle();
  const context: AppContext = { config, store };
  const services = createServiceContainer(store, config, lifecycle);

  const app = express();
  const logger = pino({ level: config.NODE_ENV === 'production' ? 'info' : 'debug' });

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '1mb' }));
  app.use(createCookieParser());
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN ?? true, credentials: true }));
  app.use(rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  const openApiSpec = createOpenApiSpec(config);
  app.get(config.openApiPath, (_req, res) => res.json(openApiSpec));
  app.use(config.docsPath, swaggerUi.serve, swaggerUi.setup(openApiSpec));

  const auth = requireAuth(context);

  app.use(config.apiBasePath, createHealthRouter(services.health));
  if (config.AUTH_PROVIDER === 'local') {
    app.use(`${config.apiBasePath}/auth`, createAuthRouter(services.auth, auth));
  } else {
    app.use(`${config.apiBasePath}/auth`, createSupabaseAuthRouter(services.auth));
  }

  app.use(`${config.apiBasePath}/profile`, auth, createProfileRouter(services.profile));
  app.use(`${config.apiBasePath}/categories`, auth, createCategoryRouter(services.categories));
  app.use(`${config.apiBasePath}/transactions`, auth, createTransactionRouter(services.transactions));
  app.use(`${config.apiBasePath}/budgets`, auth, createBudgetRouter(services.budgets));
  app.use(`${config.apiBasePath}/plans`, auth, createPlansRouter(services.plans));
  app.use(`${config.apiBasePath}/catalog`, auth, createCatalogRouter(services.catalog));
  app.use(`${config.apiBasePath}/loans`, auth, createLoansRouter(services.loans));
  app.use(`${config.apiBasePath}/reports`, auth, createReportsRouter(services.reports));

  app.use((_req, _res, next) => next(notFound()));
  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    void next;
    if (!res.headersSent) {
      sendError(res, error instanceof Error ? error : new Error('Unknown error'));
    }
  });

  return { app, context, lifecycle, services };
}


