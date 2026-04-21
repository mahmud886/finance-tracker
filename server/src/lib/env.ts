import { ValidationError } from './errors';

interface EnvironmentVars {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATA_FILE: string;
  CORS_ORIGIN?: string;
  COOKIE_NAME: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  RESET_TOKEN_TTL_MINUTES: number;
  PUBLIC_API_URL?: string;
}

function parseEnvNumber(value: string | undefined, defaultValue?: number, name?: string): number {
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new ValidationError('ENV_MISSING', `Missing required numeric environment variable: ${name}`);
    }
    return defaultValue;
  }

  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new ValidationError('ENV_INVALID', `Invalid numeric value for ${name}: ${value}`);
  }

  return num;
}

function parseEnvString(value: string | undefined, name?: string, required = true): string {
  if (!value) {
    if (required) {
      throw new ValidationError('ENV_MISSING', `Missing required environment variable: ${name}`);
    }
    return '';
  }

  return value.trim();
}

export function validateEnvironment(): EnvironmentVars {
  const nodeEnv = parseEnvString(process.env.NODE_ENV, 'NODE_ENV', false) || 'development';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new ValidationError('ENV_INVALID', `Invalid NODE_ENV: ${nodeEnv}`);
  }

  return {
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test',
    PORT: parseEnvNumber(process.env.PORT, 3000, 'PORT'),
    JWT_SECRET: parseEnvString(process.env.JWT_SECRET, 'JWT_SECRET'),
    JWT_EXPIRES_IN: parseEnvString(process.env.JWT_EXPIRES_IN || '7d', 'JWT_EXPIRES_IN', false),
    DATA_FILE: parseEnvString(process.env.DATA_FILE || './data.json', 'DATA_FILE', false),
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    COOKIE_NAME: parseEnvString(process.env.COOKIE_NAME || 'ft_token', 'COOKIE_NAME', false),
    RATE_LIMIT_WINDOW_MS: parseEnvNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000, 'RATE_LIMIT_WINDOW_MS'),
    RATE_LIMIT_MAX: parseEnvNumber(process.env.RATE_LIMIT_MAX, 1000, 'RATE_LIMIT_MAX'),
    RESET_TOKEN_TTL_MINUTES: parseEnvNumber(process.env.RESET_TOKEN_TTL_MINUTES, 15, 'RESET_TOKEN_TTL_MINUTES'),
    PUBLIC_API_URL: process.env.PUBLIC_API_URL,
  };
}

