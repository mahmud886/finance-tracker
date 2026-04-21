/**
 * Frontend environment validation and exports
 * Centralizes all environment variable access with type safety
 */

interface FrontendEnv {
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_API_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

function validateFrontendEnv(): FrontendEnv {
  const requiredVars = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[ENV WARNING] Missing environment variables: ${missing.join(', ')}. 
       Check your .env file at the project root.`,
    );
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: nodeEnv,
  };
}

// Validate and export environment
export const env = validateFrontendEnv();

// Type-safe getters
export function getApiUrl(): string {
  return env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_SITE_URL;
}

export function getSupabaseUrl(): string {
  return env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseKey(): string {
  return env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

