import type {
  TransactionCreateInput,
  TransactionUpdateInput,
} from '../domain';
import type { AppContext } from '../types';

type ListFilters = {
  limit: number;
  offset: number;
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export class TransactionsService {
  constructor(private readonly context: AppContext) {}

  async list(userId: string, filters: ListFilters) {
    return this.context.store.listTransactions(userId, filters);
  }

  async get(userId: string, id: string) {
    return this.context.store.getTransaction(userId, id);
  }

  async create(userId: string, input: TransactionCreateInput) {
    return this.context.store.createTransaction(userId, input);
  }

  async update(userId: string, id: string, patch: TransactionUpdateInput) {
    return this.context.store.updateTransaction(userId, id, patch);
  }

  async remove(userId: string, id: string) {
    await this.context.store.deleteTransaction(userId, id);
  }
}

