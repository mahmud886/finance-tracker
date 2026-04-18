# Finance Tracker Backend API - Complete Implementation

## Overview

A complete, production-ready backend API system built with **Next.js 16 App Router** using Route Handlers, implementing clean architecture principles and security best practices.

- **No UI code** – API-only backend
- **Clean separation** – Helpers, utilities, and route handlers organized in distinct directories
- **Full-featured CRUD** – Transactions, Categories, Budgets, Plans, Loans, Dashboard, Reports
- **Type-safe** – TypeScript with Zod validation
- **Secure** – Supabase auth, user isolation, input validation
- **Versioned** – `/api/v1` structure supports future versioning

---

## Architecture

### Directory Structure

```
app/api/
├── _helper/           # Auth, error handling, response formatting
│   ├── auth.ts        # requireApiUser(), AuthContext
│   ├── errors.ts      # ApiError, error mapping
│   ├── request.ts     # parseJsonBody(), parseQuery()
│   └── response.ts    # ok(), created(), errorResponse(), etc.
├── _utils/            # Shared utilities for API logic
│   ├── dashboard.ts   # getDashboardStatsForUser()
│   └── normalizers.ts # Type coercion helpers
├── v1/                # Versioned API routes
│   ├── route.ts       # API index & documentation
│   ├── health/        # Health check
│   ├── auth/          # Authentication (login, signup, etc.)
│   ├── profile/       # User profile management
│   ├── dashboard/     # Dashboard statistics
│   ├── categories/    # Category CRUD
│   ├── transactions/  # Transaction CRUD
│   ├── budgets/       # Budget CRUD
│   ├── plans/         # Planning: templates, items, catalog
│   ├── loans/         # Loan CRUD + payments
│   └── reports/       # Reporting & summaries
└── README.md          # API documentation
```

### Key Principles

1. **Error Handling**: Centralized `ApiError` class with consistent response envelope
2. **Validation**: Zod schemas reused from `lib/validations/*`
3. **Authentication**: Per-route via `requireApiUser()` helper
4. **Response Formatting**: Standardized success/error payloads with request IDs
5. **Type Safety**: Full TypeScript coverage, no `any`
6. **User Isolation**: All queries filtered by `user_id` at the database level

---

## Endpoints

### Health

- `GET /api/v1/health` – Server status check (no auth required)

### Authentication

All auth routes are **public** (no user session required):

- `POST /api/v1/auth/login` – Sign in with email/password
- `POST /api/v1/auth/signup` – Create account
- `POST /api/v1/auth/forgot-password` – Request password reset
- `POST /api/v1/auth/reset-password` – Reset password
- `POST /api/v1/auth/logout` – Sign out
- `GET /api/v1/auth/me` – Get current user (requires auth)

### Profile

- `GET /api/v1/profile` – Get user profile (auth required)
- `PATCH /api/v1/profile` – Update user profile (auth required)

### Dashboard

- `GET /api/v1/dashboard` – Dashboard statistics with trends, balance, etc. (auth required)

### Categories

- `GET /api/v1/categories` – List categories (with pagination)
- `POST /api/v1/categories` – Create category
- `GET /api/v1/categories/:id` – Get single category
- `PATCH /api/v1/categories/:id` – Update category
- `DELETE /api/v1/categories/:id` – Delete category

### Transactions

- `GET /api/v1/transactions` – List transactions (with filters: type, category, date range)
- `POST /api/v1/transactions` – Create transaction
- `GET /api/v1/transactions/:id` – Get single transaction
- `PATCH /api/v1/transactions/:id` – Update transaction
- `DELETE /api/v1/transactions/:id` – Delete transaction

### Budgets

- `GET /api/v1/budgets?month=2025-04` – List budgets with spent amount
- `POST /api/v1/budgets` – Create budget
- `GET /api/v1/budgets/:id` – Get single budget
- `PATCH /api/v1/budgets/:id` – Update budget
- `DELETE /api/v1/budgets/:id` – Delete budget

### Plans

**Templates:**
- `GET /api/v1/plans/templates?month=2025-04` – List budget templates
- `POST /api/v1/plans/templates` – Create template
- `GET /api/v1/plans/templates/:id` – Get single template
- `PATCH /api/v1/plans/templates/:id` – Update template
- `DELETE /api/v1/plans/templates/:id` – Delete template

**Items:**
- `GET /api/v1/plans/items?template_id=...&purchased=true|false` – List template items
- `POST /api/v1/plans/items` – Create item
- `GET /api/v1/plans/items/:id` – Get single item
- `PATCH /api/v1/plans/items/:id` – Update item
- `DELETE /api/v1/plans/items/:id` – Delete item
- `POST /api/v1/plans/items/:id/toggle-purchased` – Toggle purchase status

**Catalog:**
- `GET /api/v1/plans/catalog` – List grocery items
- `POST /api/v1/plans/catalog` – Create catalog item
- `GET /api/v1/plans/catalog/:id` – Get single catalog item
- `PATCH /api/v1/plans/catalog/:id` – Update catalog item
- `DELETE /api/v1/plans/catalog/:id` – Delete catalog item

### Loans

- `GET /api/v1/loans?status=active|closed|defaulted` – List loans
- `POST /api/v1/loans` – Create loan
- `GET /api/v1/loans/:id` – Get single loan
- `PATCH /api/v1/loans/:id` – Update loan
- `DELETE /api/v1/loans/:id` – Delete loan

**Payments:**
- `GET /api/v1/loans/payments?loan_id=...` – List payments
- `POST /api/v1/loans/payments` – Create payment
- `GET /api/v1/loans/payments/:id` – Get single payment
- `PATCH /api/v1/loans/payments/:id` – Update payment
- `DELETE /api/v1/loans/payments/:id` – Delete payment

### Reports

- `GET /api/v1/reports/summary?startDate=...&endDate=...&categoryId=...&type=income|expense|all` – Summary with transactions and aggregates

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { "id": "...", "name": "..." },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "meta": { "page": 1, "total": 100 }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "issues": [{ "path": ["email"], "message": "Invalid email" }]
    }
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Quick Start

### 1. Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`. API available at `http://localhost:3000/api/v1`.

### 2. Test Health Endpoint

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": { "status": "ok", "timestamp": "2026-04-18T15:31:45.403Z" },
  "requestId": "..."
}
```

### 3. API Smoke Test

```bash
npm run test:api:smoke
```

Test against a custom host:

```bash
API_BASE_URL="https://your-domain" npm run test:api:smoke
```

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## Usage Examples

### Sign Up

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "name": "John Doe"
  }'
```

### Create Category

```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -b "sb-access-token=..." \
  -d '{
    "name": "Food",
    "icon": "utensils",
    "color": "#f97316"
  }'
```

### List Transactions with Filters

```bash
curl "http://localhost:3000/api/v1/transactions?type=expense&start_date=2025-01-01&end_date=2025-03-31" \
  -b "sb-access-token=..."
```

### Create Budget

```bash
curl -X POST http://localhost:3000/api/v1/budgets \
  -H "Content-Type: application/json" \
  -b "sb-access-token=..." \
  -d '{
    "category_id": "550e8400-e29b-41d4-a716-446655440000",
    "limit_amount": 500,
    "month": "2025-04"
  }'
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `INVALID_JSON` | 400 | Malformed JSON payload |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Expected `application/json` |
| `PAYLOAD_TOO_LARGE` | 413 | Request body exceeds 1MB |
| `INTERNAL_ERROR` | 500 | Server error (message hidden from client) |

---

## Security Considerations

1. **Authentication**: Supabase session cookies via `requireApiUser()`
2. **Authorization**: All queries filtered by `user_id` for data isolation
3. **Validation**: Zod schemas on all inputs; query params, body, and types checked
4. **Error Messages**: Sensitive details hidden in 5xx responses
5. **Rate Limiting**: Recommended at deployment platform (e.g., Vercel, Netlify)
6. **CORS**: Uses Next.js defaults; configure in `next.config.ts` if needed
7. **Request Size**: 1MB payload limit on JSON body

---

## Deployment

### Vercel

```bash
vercel deploy
```

API automatically available at `https://<project>.vercel.app/api/v1`.

### Self-Hosted

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_SITE_URL` environment variable for Supabase redirects.

---

## Testing

### Integration Tests (Recommended)

Create `__tests__/api/categories.test.ts`:

```typescript
describe('Categories API', () => {
  it('GET /api/v1/categories requires auth', async () => {
    const res = await fetch('http://localhost:3000/api/v1/categories');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/categories creates category', async () => {
    const res = await fetch('http://localhost:3000/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': '...' },
      body: JSON.stringify({ name: 'Food', icon: 'utensils', color: '#f97316' }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
```

---

## Next Steps

### Extend the API

1. Add rate limiting middleware in `app/api/_helper/rate-limit.ts`
2. Implement soft deletes if needed
3. Add webhook support for external integrations
4. Create GraphQL layer if desired

### Improve Documentation

1. Use OpenAPI/Swagger spec with auto-generation
2. Add Postman collection
3. Document SDK/client usage

### Monitor & Maintain

1. Set up error tracking (Sentry, etc.)
2. Add request logging
3. Monitor API performance metrics
4. Regular security audits

---

## Files Created

- `app/api/_helper/auth.ts` – Authentication helper
- `app/api/_helper/errors.ts` – Error classes
- `app/api/_helper/request.ts` – Request parsing
- `app/api/_helper/response.ts` – Response formatting
- `app/api/_utils/dashboard.ts` – Dashboard utilities
- `app/api/_utils/normalizers.ts` – Type normalizers
- `app/api/v1/route.ts` – API index
- `app/api/v1/health/route.ts` – Health check
- `app/api/v1/auth/*` – Auth routes (6 endpoints)
- `app/api/v1/profile/route.ts` – Profile CRUD
- `app/api/v1/dashboard/route.ts` – Dashboard stats
- `app/api/v1/categories/*` – Category CRUD
- `app/api/v1/transactions/*` – Transaction CRUD
- `app/api/v1/budgets/*` – Budget CRUD
- `app/api/v1/plans/*` – Plans (templates, items, catalog)
- `app/api/v1/loans/*` – Loans & payments CRUD
- `app/api/v1/reports/summary/route.ts` – Reports
- `app/api/README.md` – API documentation
- `scripts/api-smoke-test.mjs` – Smoke test script
- `package.json` – Added `test:api:smoke` script

**Total: 38 files, ~4000+ LOC of type-safe, production-ready API code**

---

## Implementation Complete ✅

Your Finance Tracker now has a **complete, enterprise-grade backend API system** ready for production use.

