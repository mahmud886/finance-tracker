# Finance Tracker API

Versioned API routes live under `app/api/v1`.

## Base URL

- Local: `http://localhost:3000/api/v1`

## Quick smoke test

Start the app, then run:

```bash
npm run test:api:smoke
```

Use a custom host with:

```bash
API_BASE_URL="https://your-host" npm run test:api:smoke
```

## Authentication

- Uses Supabase auth cookies.
- Public auth routes:
  - `POST /auth/login`
  - `POST /auth/signup`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `POST /auth/logout`
- Authenticated routes require a valid session cookie.

## Main resources

- `GET /health`
- `GET /profile`, `PATCH /profile`
- `GET /dashboard`
- `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id`
- `GET/POST /transactions`, `GET/PATCH/DELETE /transactions/:id`
- `GET/POST /budgets`, `GET/PATCH/DELETE /budgets/:id`
- `GET/POST /plans/templates`, `GET/PATCH/DELETE /plans/templates/:id`
- `GET/POST /plans/items`, `GET/PATCH/DELETE /plans/items/:id`
- `POST /plans/items/:id/toggle-purchased`
- `GET/POST /plans/catalog`, `GET/PATCH/DELETE /plans/catalog/:id`
- `GET/POST /loans`, `GET/PATCH/DELETE /loans/:id`
- `GET/POST /loans/payments`, `GET/PATCH/DELETE /loans/payments/:id`
- `GET /reports/summary`

## Response format

Successful response:

```json
{
  "success": true,
  "data": {},
  "requestId": "..."
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed"
  },
  "requestId": "..."
}
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **ReDoc**: [http://localhost:3000/api-docs-redoc](http://localhost:3000/api-docs-redoc)
- **OpenAPI Spec**: [http://localhost:3000/api/v1/openapi.json](http://localhost:3000/api/v1/openapi.json)

The API documentation is **fully interactive** - test endpoints directly from your browser using the "Try it out" feature.

Swagger UI and ReDoc are pinned to **light mode** for readability regardless of app theme.

## Postman

- Collection: `postman/Finance-Tracker-API.postman_collection.json`
- Environment: `postman/Finance-Tracker-Local.postman_environment.json`

Import both files into Postman, then:

1. Select the `Finance Tracker Local` environment.
2. Run `POST /auth/login` first.
3. The collection automatically captures `sb-access-token` and `sb-refresh-token` from `Set-Cookie` and stores `authCookie`.
4. Run protected requests (profile, transactions, budgets, etc.).

If protected requests still return `401`, clear `authCookie` and run `POST /auth/login` again.

If requests return `404`, confirm `baseUrl` is exactly `http://localhost:3000/api/v1`.
The collection pre-request script auto-normalizes common mistakes like `http://localhost:3000` or `http://localhost:3000/api`.

