# Swagger API Documentation

Complete OpenAPI 3.0 specification for the Finance Tracker API with interactive documentation.

## 📚 Documentation URLs

### Swagger UI
```
http://localhost:3000/api-docs
```
Interactive API explorer with "Try it out" feature for testing endpoints directly.

### ReDoc Alternative
```
http://localhost:3000/api-docs-redoc
```
Clean, modern API documentation view.

### Raw OpenAPI Spec
```
http://localhost:3000/api/v1/openapi.json
```
JSON OpenAPI 3.0 specification (machine-readable).

---

## 🚀 Features

### Complete API Coverage
- ✅ All 30+ endpoints documented
- ✅ Full request/response schemas
- ✅ Example values for all fields
- ✅ Parameter descriptions
- ✅ Error codes and responses
- ✅ Authentication requirements

### Interactive Testing
- **Swagger UI**: Try endpoints directly from the browser
- **Request Building**: Automatic form generation
- **Response Visualization**: Formatted JSON responses
- **Authentication**: Cookie-based auth support

### Developer-Friendly
- Clear parameter documentation
- Response schema references
- Example requests & responses
- Error handling guide
- Security scheme documentation

---

## 🔐 Authentication in Swagger UI

1. **Sign up** using `/auth/signup` endpoint (no auth required)
   ```json
   {
     "email": "test@example.com",
     "password": "securepass123",
     "name": "Test User"
   }
   ```

2. **Sign in** using `/auth/login` endpoint (sets cookie automatically)
   ```json
   {
     "email": "test@example.com",
     "password": "securepass123"
   }
   ```

3. **Swagger UI** automatically includes the session cookie in subsequent requests

4. **Test protected endpoints** using "Try it out" button

---

## 📋 OpenAPI Spec Structure

### Info Section
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Finance Tracker API",
    "version": "1.0.0",
    "description": "Complete backend API for personal finance management"
  }
}
```

### Servers
```json
{
  "servers": [
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Development"
    },
    {
      "url": "https://your-domain.com/api/v1",
      "description": "Production"
    }
  ]
}
```

### Component Schemas
- `User` – User profile
- `Category` – Transaction category
- `Transaction` – Income/expense transaction
- `Budget` – Monthly budget
- `BudgetTemplate` – Spending plan template
- `TemplateItem` – Item in spending plan
- `Loan` – Loan record
- `LoanPayment` – Loan payment record
- `DashboardStats` – Full dashboard statistics
- `SuccessResponse` – Standard success envelope
- `ErrorResponse` – Standard error envelope

### Security Schemes
```json
{
  "cookieAuth": {
    "type": "apiKey",
    "in": "cookie",
    "name": "sb-access-token",
    "description": "Supabase session cookie"
  }
}
```

---

## 🔍 Endpoint Examples in Swagger

### Example: Create Category
1. Navigate to `/categories` → `POST`
2. Click "Try it out"
3. Enter request body:
   ```json
   {
     "name": "Food",
     "icon": "utensils",
     "color": "#f97316"
   }
   ```
4. Click "Execute"
5. View response with created category object

### Example: List Transactions with Filters
1. Navigate to `/transactions` → `GET`
2. Click "Try it out"
3. Set parameters:
   - `type`: `expense`
   - `start_date`: `2025-01-01`
   - `end_date`: `2025-03-31`
4. Click "Execute"
5. View filtered results

---

## 📌 API Organization by Tag

### Health
- `GET /health` – Server status

### Auth (Public)
- `POST /auth/login` – Sign in
- `POST /auth/signup` – Create account
- `POST /auth/forgot-password` – Request reset
- `POST /auth/reset-password` – Reset password
- `POST /auth/logout` – Sign out
- `GET /auth/me` – Get current user

### Profile (Protected)
- `GET /profile` – Get profile
- `PATCH /profile` – Update profile

### Dashboard (Protected)
- `GET /dashboard` – Full statistics

### Categories (Protected)
- `GET /categories` – List
- `POST /categories` – Create
- `GET /categories/{id}` – Get single
- `PATCH /categories/{id}` – Update
- `DELETE /categories/{id}` – Delete

### Transactions (Protected)
- `GET /transactions` – List (with filters)
- `POST /transactions` – Create
- `GET /transactions/{id}` – Get single
- `PATCH /transactions/{id}` – Update
- `DELETE /transactions/{id}` – Delete

### Budgets (Protected)
- `GET /budgets` – List by month
- `POST /budgets` – Create
- `GET /budgets/{id}` – Get single
- `PATCH /budgets/{id}` – Update
- `DELETE /budgets/{id}` – Delete

### Plans (Protected)
- `GET /plans/templates` – List templates
- `POST /plans/templates` – Create template
- `GET /plans/templates/{id}` – Get template
- `PATCH /plans/templates/{id}` – Update template
- `DELETE /plans/templates/{id}` – Delete template
- `GET /plans/items` – List items
- `POST /plans/items` – Create item
- `GET /plans/items/{id}` – Get item
- `PATCH /plans/items/{id}` – Update item
- `DELETE /plans/items/{id}` – Delete item
- `POST /plans/items/{id}/toggle-purchased` – Toggle status
- `GET /plans/catalog` – List catalog
- `POST /plans/catalog` – Create catalog item
- `GET /plans/catalog/{id}` – Get catalog item
- `PATCH /plans/catalog/{id}` – Update catalog item
- `DELETE /plans/catalog/{id}` – Delete catalog item

### Loans (Protected)
- `GET /loans` – List (by status)
- `POST /loans` – Create
- `GET /loans/{id}` – Get single
- `PATCH /loans/{id}` – Update
- `DELETE /loans/{id}` – Delete
- `GET /loans/payments` – List payments
- `POST /loans/payments` – Create payment
- `GET /loans/payments/{id}` – Get payment
- `PATCH /loans/payments/{id}` – Update payment
- `DELETE /loans/payments/{id}` – Delete payment

### Reports (Protected)
- `GET /reports/summary` – Transaction summary with filters

---

## 🛠️ Integration

### Using Swagger/OpenAPI in Your Projects

**TypeScript/JavaScript Client Generation:**
```bash
# Using OpenAPI Generator
npm install @openapitools/openapi-generator-cli

# Generate client
openapi-generator-cli generate \
  -i http://localhost:3000/api/v1/openapi.json \
  -g typescript-fetch \
  -o ./generated-client
```

**Python Client Generation:**
```bash
pip install openapi-python-client
openapi-python-client generate --url http://localhost:3000/api/v1/openapi.json
```

**Postman Import:**
1. Open Postman
2. File → Import
3. Select "Link"
4. Paste: `http://localhost:3000/api/v1/openapi.json`
5. Click Import

---

## 📖 Documentation Standards

### Response Envelopes
All responses wrapped in standard envelope:

**Success:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "requestId": "uuid",
  "meta": { /* optional */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { /* optional */ }
  },
  "requestId": "uuid"
}
```

### HTTP Status Codes
- `200` – OK (GET, PATCH)
- `201` – Created (POST)
- `204` – No Content (DELETE)
- `400` – Bad Request (malformed JSON)
- `401` – Unauthorized (missing auth)
- `404` – Not Found
- `413` – Payload Too Large
- `415` – Unsupported Media Type
- `422` – Validation Error
- `500` – Internal Server Error

---

## 🔄 Update OpenAPI Spec

The OpenAPI spec is **auto-generated** from the route handler. To update it:

1. Edit `/app/api/v1/openapi.json/route.ts`
2. Update the `openApiSpec` object
3. Changes appear immediately at `http://localhost:3000/api/v1/openapi.json`
4. Swagger UI and ReDoc auto-refresh

---

## 🚀 Production Setup

### Update Servers
```typescript
// In openapi.json route handler
servers: [
  {
    url: "https://api.yourdomain.com/v1",
    description: "Production"
  },
  // ... other servers
]
```

### Deploy Documentation
- `http://localhost:3000/api-docs` → `https://yourdomain.com/api-docs`
- `http://localhost:3000/api-docs-redoc` → `https://yourdomain.com/api-docs-redoc`
- Both served by Next.js automatically

### Enable CORS (if needed)
```typescript
// In proxy.ts or middleware
export const config = {
  matcher: ["/api/v1/:path*"]
};

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
```

---

## 📊 Features Documented

✅ All CRUD operations  
✅ Filtering & pagination  
✅ Date range filtering  
✅ Status filtering  
✅ Authentication flows  
✅ Error scenarios  
✅ Field validations  
✅ Data constraints  
✅ Optional parameters  
✅ Required parameters  

---

## 🎯 Quick Reference

| Task | URL |
|------|-----|
| Interactive API Explorer | `/api-docs` |
| Clean API Documentation | `/api-docs-redoc` |
| Raw Spec (JSON) | `/api/v1/openapi.json` |
| API Root with Discovery | `/api/v1` |
| Health Check | `/api/v1/health` |

---

## 📝 Next Steps

1. **Test endpoints** in Swagger UI
2. **Generate client code** for your frontend
3. **Import to Postman** for team collaboration
4. **Customize spec** for your environment
5. **Deploy documentation** alongside API

---

**Swagger API Documentation Complete** ✅

