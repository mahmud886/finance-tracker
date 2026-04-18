import { ok } from "@/app/api/_helper/response";

export async function GET(request: Request) {
  return ok(request, {
    name: "Finance Tracker API",
    version: "v1",
    endpoints: {
      health: "/api/v1/health",
      auth: {
        login: "/api/v1/auth/login",
        signup: "/api/v1/auth/signup",
        forgotPassword: "/api/v1/auth/forgot-password",
        resetPassword: "/api/v1/auth/reset-password",
        logout: "/api/v1/auth/logout",
        me: "/api/v1/auth/me",
      },
      profile: "/api/v1/profile",
      dashboard: "/api/v1/dashboard",
      categories: "/api/v1/categories",
      transactions: "/api/v1/transactions",
      budgets: "/api/v1/budgets",
      plans: {
        templates: "/api/v1/plans/templates",
        items: "/api/v1/plans/items",
        catalog: "/api/v1/plans/catalog",
      },
      loans: {
        loans: "/api/v1/loans",
        payments: "/api/v1/loans/payments",
      },
      reports: "/api/v1/reports/summary",
    },
  });
}

