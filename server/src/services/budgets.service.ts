import type {
  BudgetCreateInput,
  BudgetUpdateInput,
} from '../domain';
import type { AppContext } from '../types';

export class BudgetsService {
  constructor(private readonly context: AppContext) {}

  async list(userId: string, filters: { month?: string }) {
    return this.context.store.listBudgets(userId, filters);
  }

  async get(userId: string, id: string) {
    return this.context.store.getBudget(userId, id);
  }

  async create(userId: string, input: BudgetCreateInput) {
    return this.context.store.createBudget(userId, input);
  }

  async update(userId: string, id: string, patch: BudgetUpdateInput) {
    return this.context.store.updateBudget(userId, id, patch);
  }

  async remove(userId: string, id: string) {
    await this.context.store.deleteBudget(userId, id);
  }
}

