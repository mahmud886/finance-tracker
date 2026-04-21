# Finance Tracker Express API

A standalone, API-only backend for the Finance Tracker application built with **Express**, **TypeScript**, **Zod**, **JWT auth**, **Swagger UI**, and a persistent JSON datastore.

## Highlights

- Versioned API at `/api/v1`
- Configurable auth: local JWT or Supabase access token verification
- Zod validation for every write endpoint
- Security middleware: Helmet, CORS, and rate limiting
- Persistent file-backed repository for local development and demos
- Swagger UI at `/api-docs`
- OpenAPI JSON at `/api/v1/openapi.json`
- Postman collection for quick testing

## Quick Start

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Then open:

- `http://localhost:4000/api-docs`
- `http://localhost:4000/api/v1/openapi.json`
- `http://localhost:4000/api/v1/health`

## Environment Variables

| Name | Purpose |
| --- | --- |
| `PORT` | Server port |
| `NODE_ENV` | `development`, `test`, or `production` |
| `AUTH_PROVIDER` | `local` or `supabase` |
| `JWT_SECRET` | Secret used to sign access tokens (`AUTH_PROVIDER=local`) |
| `JWT_EXPIRES_IN` | JWT expiration, e.g. `7d` |
| `SUPABASE_URL` | Supabase project URL (`AUTH_PROVIDER=supabase`) |
| `SUPABASE_ANON_KEY` | Supabase anon key (`AUTH_PROVIDER=supabase`) |
| `DATA_FILE` | JSON persistence file |
| `CORS_ORIGIN` | Allowed frontend origin |
| `COOKIE_NAME` | Cookie name used for auth |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `RATE_LIMIT_MAX` | Max requests per window |
| `RESET_TOKEN_TTL_MINUTES` | Forgot/reset password token TTL |
| `PUBLIC_API_URL` | Base URL used in docs and Postman |

## Supabase Token Exchange

When `AUTH_PROVIDER=supabase`, the backend does not use `/auth/login`.
Instead, exchange a Supabase session token for a backend JWT:

```bash
curl -X POST http://localhost:4000/api/v1/auth/exchange \
  -H 'content-type: application/json' \
  -d '{"accessToken":"<supabase-access-token>"}'
```

Response includes a backend `token` (also set as cookie) signed with `JWT_SECRET` and expiring by `JWT_EXPIRES_IN` (for example, `7d`).

## Testing

```bash
npm run test
npm run build
```

## Postman

Import the files from `postman/`:

- `Finance-Tracker-API.postman_collection.json`
- `Finance-Tracker-Local.postman_environment.json`

## Architecture

- `src/routes/*.routes.ts` – route registration only (Express wiring)
- `src/controllers/*.controller.ts` – HTTP controllers (request/response orchestration)
- `src/services/*.service.ts` – business services (use cases)
- `src/store.ts` + `src/domain.ts` – data model + validation schemas
- `src/app.ts` / `src/server.ts` – app bootstrap and runtime lifecycle
- `src/openapi.ts` – OpenAPI spec served at `/api/v1/openapi.json`
- `tests/*.test.ts` – API, readiness, and invariants test suites

## Notes

This package is intentionally isolated from the existing Next.js app in the workspace so the two systems can evolve independently.

