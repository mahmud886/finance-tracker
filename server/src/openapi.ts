import type { AppConfig } from './config';

export function createOpenApiSpec(config: AppConfig) {
  return {
    openapi: '3.0.3',
    info: {
      title: config.apiTitle,
      version: '1.0.0',
      description: `Finance Tracker API (Express + TypeScript).

AUTH MODE: ${config.AUTH_PROVIDER.toUpperCase()}

${config.AUTH_PROVIDER === 'supabase' ? `SUPABASE MODE - HOW TO TEST:
1. Sign up/login via Supabase dashboard or app at: https://etrcxfpicjyytdmfriuw.supabase.co
2. Get your Supabase access token from the session
3. Call POST /api/v1/auth/exchange with { "accessToken": "your-supabase-token" }
4. Copy the returned "token" value
5. Click Authorize button below and paste: Bearer <token>
6. Test all protected endpoints

IMPORTANT: Users must authenticate via Supabase first. This API only validates & exchanges tokens.` : `LOCAL MODE - HOW TO TEST:
1. Call POST /api/v1/auth/signup with email/password/name
2. Or call POST /api/v1/auth/login with email/password
3. Copy the returned "token" value
4. Click Authorize button below and paste: Bearer <token>
5. Test all protected endpoints`}`,
    },
    servers: [{ url: config.PUBLIC_API_URL ?? `http://localhost:${config.PORT}` }],
    tags: [
      { name: 'Health' },
      { name: 'Auth' },
      { name: 'Profile' },
      { name: 'Categories' },
      { name: 'Transactions' },
      { name: 'Budgets' },
      { name: 'Plans' },
      { name: 'Catalog' },
      { name: 'Loans' },
      { name: 'Reports' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'super-secret-123' },
            name: { type: 'string', example: 'Jane Doe' },
            currency: { type: 'string', example: 'USD' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'super-secret-123' },
          },
        },
        ExchangeRequest: {
          type: 'object',
          required: ['accessToken'],
          properties: {
            accessToken: { type: 'string', example: 'supabase-access-token' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/v1/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          security: [],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/ready': {
        get: {
          tags: ['Health'],
          summary: 'Readiness check',
          security: [],
          responses: { '200': { description: 'Ready' }, '503': { description: 'Shutting down' } },
        },
      },
      '/api/v1/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: `${config.AUTH_PROVIDER === 'supabase' ? '[LOCAL MODE ONLY] ' : ''}Register user`,
          description: config.AUTH_PROVIDER === 'supabase' ? 'This endpoint is disabled in Supabase mode. Use Supabase auth instead.' : 'Create a new user account.',
          deprecated: config.AUTH_PROVIDER === 'supabase',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SignupRequest' },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: `${config.AUTH_PROVIDER === 'supabase' ? '[LOCAL MODE ONLY] ' : ''}Login user`,
          description: config.AUTH_PROVIDER === 'supabase' ? 'This endpoint is disabled in Supabase mode. Use POST /auth/exchange instead.' : 'Login with email and password.',
          deprecated: config.AUTH_PROVIDER === 'supabase',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/auth/exchange': {
        post: {
          tags: ['Auth'],
          summary: `${config.AUTH_PROVIDER === 'supabase' ? '[REQUIRED] ' : '[SUPABASE MODE ONLY] '}Exchange Supabase token for backend JWT`,
          description: config.AUTH_PROVIDER === 'supabase'
            ? 'Exchange a valid Supabase access token for a backend JWT (7-day expiry). Call this after Supabase login/signup.'
            : 'This endpoint is only available in Supabase auth mode.',
          deprecated: config.AUTH_PROVIDER !== 'supabase',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExchangeRequest' },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: `${config.AUTH_PROVIDER === 'supabase' ? '[LOCAL MODE ONLY] ' : ''}Request password reset`,
          description: config.AUTH_PROVIDER === 'supabase' ? 'This endpoint is disabled in Supabase mode. Use Supabase password reset instead.' : 'Request a password reset token.',
          deprecated: config.AUTH_PROVIDER === 'supabase',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: { email: { type: 'string', format: 'email', example: 'user@example.com' } },
                },
              },
            },
          },
          responses: { '200': { description: 'Accepted' } },
        },
      },
      '/api/v1/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: `${config.AUTH_PROVIDER === 'supabase' ? '[LOCAL MODE ONLY] ' : ''}Reset password`,
          description: config.AUTH_PROVIDER === 'supabase' ? 'This endpoint is disabled in Supabase mode. Use Supabase password reset instead.' : 'Reset password with a valid token.',
          deprecated: config.AUTH_PROVIDER === 'supabase',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'password', 'confirmPassword'],
                  properties: {
                    token: { type: 'string', example: 'reset-token' },
                    password: { type: 'string', minLength: 8, example: 'new-password-123' },
                    confirmPassword: { type: 'string', minLength: 8, example: 'new-password-123' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Updated' } },
        },
      },
      '/api/v1/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout current user',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user profile from auth token',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/profile': {
        get: { tags: ['Profile'], summary: 'Get profile', responses: { '200': { description: 'OK' } } },
        patch: {
          tags: ['Profile'],
          summary: 'Update profile',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    avatarUrl: { type: 'string', nullable: true },
                    currency: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/categories': {
        get: { tags: ['Categories'], summary: 'List categories', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Categories'],
          summary: 'Create category',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'icon', 'color'],
                  properties: {
                    name: { type: 'string', example: 'Utilities' },
                    icon: { type: 'string', example: 'bolt' },
                    color: { type: 'string', example: '#123abc' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/categories/{id}': {
        get: {
          tags: ['Categories'],
          summary: 'Get category',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Categories'],
          summary: 'Update category',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Categories'],
          summary: 'Delete category',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/transactions': {
        get: { tags: ['Transactions'], summary: 'List transactions', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Transactions'],
          summary: 'Create transaction',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get transaction',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Transactions'],
          summary: 'Update transaction',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Transactions'],
          summary: 'Delete transaction',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/budgets': {
        get: { tags: ['Budgets'], summary: 'List budgets', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Budgets'],
          summary: 'Create budget',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/budgets/{id}': {
        get: {
          tags: ['Budgets'],
          summary: 'Get budget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Budgets'],
          summary: 'Update budget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Budgets'],
          summary: 'Delete budget',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/plans/templates': {
        get: { tags: ['Plans'], summary: 'List plan templates', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Plans'],
          summary: 'Create plan template',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/plans/templates/{id}': {
        get: {
          tags: ['Plans'],
          summary: 'Get plan template',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Plans'],
          summary: 'Update plan template',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Plans'],
          summary: 'Delete plan template',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/plans/items': {
        get: { tags: ['Plans'], summary: 'List plan items', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Plans'],
          summary: 'Create plan item',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/plans/items/{id}': {
        get: {
          tags: ['Plans'],
          summary: 'Get plan item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Plans'],
          summary: 'Update plan item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Plans'],
          summary: 'Delete plan item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/plans/items/{id}/toggle-purchased': {
        post: {
          tags: ['Plans'],
          summary: 'Toggle purchased status on plan item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    checked: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'OK' } },
        },
      },
      '/api/v1/catalog': {
        get: { tags: ['Catalog'], summary: 'List catalog items', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Catalog'],
          summary: 'Create catalog item',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/catalog/{id}': {
        get: {
          tags: ['Catalog'],
          summary: 'Get catalog item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Catalog'],
          summary: 'Update catalog item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Catalog'],
          summary: 'Delete catalog item',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/loans': {
        get: { tags: ['Loans'], summary: 'List loans', responses: { '200': { description: 'OK' } } },
        post: {
          tags: ['Loans'],
          summary: 'Create loan',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/loans/{id}': {
        get: {
          tags: ['Loans'],
          summary: 'Get loan',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Loans'],
          summary: 'Update loan',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Loans'],
          summary: 'Delete loan',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/loans/payments/list': {
        get: { tags: ['Loans'], summary: 'List loan payments', responses: { '200': { description: 'OK' } } },
      },
      '/api/v1/loans/payments': {
        post: {
          tags: ['Loans'],
          summary: 'Create loan payment',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/api/v1/loans/payments/{id}': {
        get: {
          tags: ['Loans'],
          summary: 'Get loan payment',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'OK' } },
        },
        patch: {
          tags: ['Loans'],
          summary: 'Update loan payment',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Loans'],
          summary: 'Delete loan payment',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '204': { description: 'No Content' } },
        },
      },
      '/api/v1/reports/dashboard': {
        get: { tags: ['Reports'], summary: 'Dashboard report', responses: { '200': { description: 'OK' } } },
      },
      '/api/v1/reports/summary': {
        get: { tags: ['Reports'], summary: 'Summary report', responses: { '200': { description: 'OK' } } },
      },
    },
  };
}

