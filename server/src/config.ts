import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AUTH_PROVIDER: z.enum(['local', 'supabase']).default('local'),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  DATA_FILE: z.string().default('./data/finance-tracker.json'),
  CORS_ORIGIN: z.string().optional(),
  COOKIE_NAME: z.string().default('ft_token'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  PUBLIC_API_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export type AppConfig = AppEnv & {
  apiBasePath: string;
  docsPath: string;
  openApiPath: string;
  apiTitle: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.superRefine((value, ctx) => {
    if (!value.JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET is required to issue backend access tokens',
      });
    }

    if (value.AUTH_PROVIDER === 'supabase') {
      if (!value.SUPABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SUPABASE_URL'],
          message: 'SUPABASE_URL is required when AUTH_PROVIDER=supabase',
        });
      }

      if (!value.SUPABASE_ANON_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SUPABASE_ANON_KEY'],
          message: 'SUPABASE_ANON_KEY is required when AUTH_PROVIDER=supabase',
        });
      }
    }
  }).parse(env);

  return {
    ...parsed,
    apiBasePath: '/api/v1',
    docsPath: '/api-docs',
    openApiPath: '/api/v1/openapi.json',
    apiTitle: 'Finance Tracker API',
  };
}

