import type { FinanceStore } from '../store';
import type { AppConfig } from '../config';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { CategoriesService } from '../services/categories.service';
import { TransactionsService } from '../services/transactions.service';
import { BudgetsService } from '../services/budgets.service';
import { PlansService } from '../services/plans.service';
import { CatalogService } from '../services/catalog.service';
import { LoansService } from '../services/loans.service';
import { ReportsService } from '../services/reports.service';
import { HealthService } from '../services/health.service';
import type { AppLifecycle } from '../lifecycle';

export interface ServiceContainer {
  auth: AuthService;
  profile: ProfileService;
  categories: CategoriesService;
  transactions: TransactionsService;
  budgets: BudgetsService;
  plans: PlansService;
  catalog: CatalogService;
  loans: LoansService;
  reports: ReportsService;
  health: HealthService;
}

export function createServiceContainer(
  store: FinanceStore,
  config: AppConfig,
  lifecycle: AppLifecycle,
): ServiceContainer {
  return {
    auth: new AuthService({ config, store }),
    profile: new ProfileService({ config, store }),
    categories: new CategoriesService({ config, store }),
    transactions: new TransactionsService({ config, store }),
    budgets: new BudgetsService({ config, store }),
    plans: new PlansService({ config, store }),
    catalog: new CatalogService({ config, store }),
    loans: new LoansService({ config, store }),
    reports: new ReportsService({ config, store }),
    health: new HealthService(lifecycle),
  };
}

