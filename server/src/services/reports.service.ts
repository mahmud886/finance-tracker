import type { AppContext } from '../types';

type SummaryFilters = {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type: 'income' | 'expense' | 'all';
  limit: number;
};

export class ReportsService {
  constructor(private readonly context: AppContext) {}

  async dashboard(userId: string) {
    return this.context.store.getDashboard(userId);
  }

  async summary(userId: string, query: SummaryFilters) {
    return this.context.store.getReportSummary(userId, query);
  }
}

