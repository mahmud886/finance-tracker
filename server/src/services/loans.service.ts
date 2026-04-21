import type {
  LoanCreateInput,
  LoanPaymentCreateInput,
  LoanPaymentUpdateInput,
  LoanUpdateInput,
} from '../domain';
import type { AppContext } from '../types';

export class LoansService {
  constructor(private readonly context: AppContext) {}

  async list(userId: string, filters: { status?: 'active' | 'closed' | 'defaulted' }) {
    return this.context.store.listLoans(userId, filters);
  }

  async create(userId: string, input: LoanCreateInput) {
    return this.context.store.createLoan(userId, input);
  }

  async get(userId: string, id: string) {
    return this.context.store.getLoan(userId, id);
  }

  async update(userId: string, id: string, patch: LoanUpdateInput) {
    return this.context.store.updateLoan(userId, id, patch);
  }

  async remove(userId: string, id: string) {
    await this.context.store.deleteLoan(userId, id);
  }

  async listPayments(userId: string, filters: { loanId?: string }) {
    return this.context.store.listLoanPayments(userId, filters);
  }

  async createPayment(userId: string, input: LoanPaymentCreateInput) {
    return this.context.store.createLoanPayment(userId, input);
  }

  async getPayment(userId: string, id: string) {
    return this.context.store.getLoanPayment(userId, id);
  }

  async updatePayment(userId: string, id: string, patch: LoanPaymentUpdateInput) {
    return this.context.store.updateLoanPayment(userId, id, patch);
  }

  async removePayment(userId: string, id: string) {
    await this.context.store.deleteLoanPayment(userId, id);
  }
}

