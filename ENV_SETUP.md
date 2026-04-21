# Frontend Environment Setup

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Frontend app URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Environment Usage in Code

Import typed environment from `lib/env.ts`:

```typescript
import { env, getApiUrl, isDevelopment } from '@/lib/env';

// Access via typed exports
const apiUrl = getApiUrl();
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Or access directly
console.log(env.NEXT_PUBLIC_SUPABASE_URL);
```

## Environment Variables Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | string | Yes | Frontend URL (used for API fallback) |
| `NEXT_PUBLIC_API_URL` | string | No | Backend API base URL (defaults to SITE_URL) |
| `NEXT_PUBLIC_SUPABASE_URL` | string | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | string | Yes | Supabase public key for schema validation |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string | Yes | Supabase anonymous key for auth |
| `NODE_ENV` | 'development' \| 'production' \| 'test' | No | Auto-set by Next.js |

## Development Setup

### 1. Backend Server (Port 4000)

```bash
cd server
npm run dev
```

This starts the Express API on `http://localhost:4000/api/v1`

### 2. Frontend App (Port 3000)

```bash
npm run dev
```

This starts Next.js on `http://localhost:3000`

### 3. Verify Environment

```bash
node -e "const env = require('./lib/env'); console.log(env.env);"
```

This should output the typed environment object without errors.

## Production Deployment

### Build

```bash
npm run build
npm start
```

### Environment at Build Time

For production builds, ensure these are set:

```bash
NEXT_PUBLIC_SITE_URL=https://app.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=<production-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<production-key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-key>
```

### Platform-Specific

**Vercel:** Set environment variables in Project Settings → Environment Variables

**Docker:**
```dockerfile
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Troubleshooting

### Missing Environment Variables

If you see this error at startup:
```
[ENV WARNING] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL
```

**Solution:** Copy all required variables from above into `.env` file

### API Connection Issues

```bash
# Check if backend is running
curl http://localhost:4000/api/v1/health

# Verify frontend env
echo $NEXT_PUBLIC_API_URL
```

### Type Safety

All environment variables are validated and typed in `lib/env.ts`. TypeScript will warn if accessing undefined vars.

