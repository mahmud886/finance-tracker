# Finance Tracker Backend - Enterprise MVC Architecture

A production-grade Express.js + TypeScript API with complete MVC pattern, dependency injection, utilities, and error handling.

## Architecture Overview

### Layer Structure

```
┌─────────────────────────────────────┐
│        Routes (thin wiring)         │
│  - route registration only          │
│  - inject services via DI container │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Controllers (HTTP handlers)    │
│  - parse & validate requests        │
│  - orchestrate service calls        │
│  - format responses                 │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│   Services (business logic)         │
│  - implement use cases              │
│  - coordinate repository calls      │
│  - enforce invariants               │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ Store/Repository (data persistence) │
│  - data access patterns             │
│  - query logic                      │
│  - data integrity                   │
└─────────────────────────────────────┘
```

## Key Features

### 1. **MVC Pattern**
- **Routes** – Express router registration via DI
- **Controllers** – HTTP request/response orchestration
- **Services** – Pure business logic & use cases
- **Store** – Data persistence layer

### 2. **Dependency Injection Container** (`src/di/container.ts`)
Centralized service composition:
```typescript
const services = createServiceContainer(store, config, lifecycle);
app.use('/api/v1/auth', createAuthRouter(services.auth, authMiddleware));
```

### 3. **Error Handling** (`src/lib/errors.ts`)
Custom error classes for different failure modes:
- `RepositoryError` – data layer issues
- `ValidationError` – input validation
- `ServiceError` – business logic violations
- `NotFoundError`, `ConflictError`, `UnauthorizedError`

### 4. **Utilities**

#### Formatters (`src/lib/formatters.ts`)
- `formatCurrency()` – currency formatting
- `formatDate()` / `formatDatetime()` – date formatting
- `formatPercentage()` – percentage formatting
- `titleCase()`, `kebabCase()`, `snakeCase()` – string transformations

#### Validators (`src/lib/validators.ts`)
- `isValidEmail()`, `isValidCurrency()`, `isValidPercentage()`
- `isValidMonth()`, `isValidDate()`, `isValidUUID()`
- `isEmpty()`, `isDefined()`, `isNonEmpty()`

#### Mappers (`src/lib/mappers.ts`)
- `mapUserToPublic()` – sanitize sensitive fields
- `mapCategoryToView()`, `mapTransactionToView()` – shape DTO
- `mapBulk()`, `partitionBy()` – collection utilities

#### Environment (`src/lib/env.ts`)
- Type-safe environment variable validation
- Required var checking at startup
- Development-friendly warnings

### 5. **Lifecycle Management** (`src/lifecycle.ts`)
- `AppLifecycle.markShuttingDown()` – graceful shutdown orchestration
- `/api/v1/ready` returns 503 during shutdown
- Load balancers drain traffic safely

### 6. **Security Hardening**
- Serialized mutations to prevent race conditions
- Invariant checks (uniqueness, referential integrity)
- Defensive state loading on restart
- HTTP security headers via Helmet
- JWT with secure cookie storage

## File Structure

```
src/
├── app.ts                           # Express app + middleware + DI wiring
├── server.ts                        # Runtime entrypoint + graceful shutdown
├── config.ts                        # Environment parsing
├── types.ts                         # Core types (AppContext, AuthUser)
├── middleware.ts                    # Request ID + JWT auth
├── validation.ts                    # Zod request parsing helpers
├── http.ts                          # Error + response envelopes
├── auth.ts                          # JWT + password utilities
├── store.ts                         # Data model + repository implementation
├── domain.ts                        # Zod schemas + types
├── lifecycle.ts                     # App shutdown lifecycle
├── openapi.ts                       # OpenAPI 3.0.3 spec
│
├── di/
│   └── container.ts                 # Service composition factory
│
├── lib/
│   ├── errors.ts                    # Custom error classes
│   ├── formatters.ts                # Data formatting utilities
│   ├── validators.ts                # Input validation helpers
│   ├── mappers.ts                   # DTO transformation
│   └── env.ts                       # Environment validation
│
├── services/                        # Business logic (10 modules)
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── categories.service.ts
│   ├── transactions.service.ts
│   ├── budgets.service.ts
│   ├── plans.service.ts
│   ├── catalog.service.ts
│   ├── loans.service.ts
│   ├── reports.service.ts
│   └── health.service.ts
│
├── controllers/                     # HTTP handlers (10 modules)
│   ├── auth.controller.ts
│   ├── profile.controller.ts
│   ├── categories.controller.ts
│   ├── transactions.controller.ts
│   ├── budgets.controller.ts
│   ├── plans.controller.ts
│   ├── catalog.controller.ts
│   ├── loans.controller.ts
│   ├── reports.controller.ts
│   └── health.controller.ts
│
└── routes/                          # Route registration (10 modules)
    ├── auth.routes.ts
    ├── profile.routes.ts
    ├── categories.routes.ts
    ├── transactions.routes.ts
    ├── budgets.routes.ts
    ├── plans.routes.ts
    ├── catalog.routes.ts
    ├── loans.routes.ts
    ├── reports.routes.ts
    └── health.routes.ts
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` – Register
- `POST /api/v1/auth/login` – Login
- `GET /api/v1/auth/me` – Current user (protected)
- `POST /api/v1/auth/logout` – Logout (protected)
- `POST /api/v1/auth/forgot-password` – Password reset link
- `POST /api/v1/auth/reset-password` – Reset password

### Protected Resources
- `/api/v1/categories` – CRUD operations
- `/api/v1/transactions` – CRUD operations
- `/api/v1/budgets` – CRUD operations
- `/api/v1/plans/templates` – CRUD operations
- `/api/v1/plans/items` – CRUD operations
- `/api/v1/catalog` – Read-only catalog
- `/api/v1/loans` – CRUD + payment tracking
- `/api/v1/reports` – Dashboard & summary reports
- `/api/v1/profile` – User profile management

### Health & Readiness
- `GET /api/v1/health` – Server health status
- `GET /api/v1/ready` – Readiness probe (503 during shutdown)

### Docs
- `GET /api/v1/openapi.json` – OpenAPI spec
- `GET /api-docs` – Swagger UI

## Environment Variables

```bash
NODE_ENV=development
PORT=4000
JWT_SECRET=<32-char-minimum>
JWT_EXPIRES_IN=7d
DATA_FILE=./data.json
CORS_ORIGIN=http://localhost:3000
COOKIE_NAME=ft_token
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=1000
RESET_TOKEN_TTL_MINUTES=15
PUBLIC_API_URL=http://localhost:4000
```

## Running the Server

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Tests
npm test
npm run test:watch
```

## Enterprise Patterns

### Service Injection
```typescript
// DI container creates all services once
const services = createServiceContainer(store, config, lifecycle);

// Routes receive services directly
app.use('/api/v1/auth', createAuthRouter(services.auth, authMiddleware));
```

### Error Boundary
```typescript
try {
  await service.operation();
} catch (error) {
  if (error instanceof ValidationError) {
    return sendError(res, error);
  }
  throw error; // Let global handler catch
}
```

### Utility Composition
```typescript
import { isValidEmail, formatCurrency, mapUserToPublic } from '../lib';

if (!isValidEmail(input.email)) throw new ValidationError(...);
const price = formatCurrency(amount);
const safe = mapUserToPublic(user);
```

### Graceful Shutdown
```typescript
process.on('SIGTERM', () => {
  lifecycle.markShuttingDown();
  server.close(() => process.exit(0));
});
```

## Testing

Run full test suite:
```bash
npm test
```

Tests verify:
- Auth flow (signup, login, token validation)
- CRUD operations for all resources
- Input validation (422 responses)
- Conflict detection (409 responses)
- Authorization (401 for missing token)
- Readiness probes during shutdown (503)
- Store invariants (unique categories, budgets)
- Serialized mutation safety

## Monitoring

- **Request logging** – Pino JSON logs with request IDs
- **Rate limiting** – 1000 req/min per IP (configurable)
- **Security headers** – Helmet security policies
- **Readiness probe** – Kubernetes-compatible `/api/v1/ready`

## Scalability Considerations

1. **Stateless design** – Multiple instances can run behind load balancer
2. **Graceful shutdown** – Drains traffic via readiness probe
3. **Error handling** – Normalized error response format
4. **Service isolation** – DI container allows easy mocking for tests
5. **Data consistency** – Serialized mutations prevent race conditions

## Next Steps

- Add database migration system
- Implement token blacklist cleanup job
- Add request validation OpenAPI schema generation
- Add distributed tracing (OpenTelemetry)
- Split store into per-module repositories for better scalability

