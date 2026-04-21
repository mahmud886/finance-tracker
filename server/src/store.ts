import { createHash, randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import {
  ApiError,
} from './http';
import type {
  BudgetCreateInput,
  BudgetRecord,
  BudgetUpdateInput,
  CatalogCreateInput,
  CatalogItemRecord,
  CatalogUpdateInput,
  CategoryCreateInput,
  CategoryRecord,
  CategoryUpdateInput,
  LoanCreateInput,
  LoanPaymentCreateInput,
  LoanPaymentRecord,
  LoanPaymentUpdateInput,
  LoanRecord,
  LoanUpdateInput,
  PlanItemCreateInput,
  PlanItemRecord,
  PlanItemUpdateInput,
  PlanTemplateRecord,
  PublicUser,
  ResetPasswordInput,
  SignupInput,
  TemplateCreateInput,
  TemplateUpdateInput,
  TogglePurchasedInput,
  TransactionCreateInput,
  TransactionRecord,
  TransactionUpdateInput,
  UserRecord,
  ProfileUpdateInput,
} from './domain';

type DataState = {
  users: UserRecord[];
  categories: CategoryRecord[];
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
  planTemplates: PlanTemplateRecord[];
  planItems: PlanItemRecord[];
  catalogItems: CatalogItemRecord[];
  loans: LoanRecord[];
  loanPayments: LoanPaymentRecord[];
  revokedJtis: string[];
};

type TransactionFilters = {
  limit: number;
  offset: number;
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

type CatalogFilters = {
  limit: number;
  offset: number;
  groupNameBn?: string;
};

type ReportFilters = {
  limit: number;
  type: 'income' | 'expense' | 'all';
  startDate?: string;
  endDate?: string;
  categoryId?: string;
};

const starterCategories = [
  { name: 'Salary', icon: 'wallet', color: '#22c55e' },
  { name: 'Food', icon: 'utensils', color: '#f97316' },
  { name: 'Rent', icon: 'house', color: '#ef4444' },
  { name: 'Transport', icon: 'car', color: '#3b82f6' },
];

const seedCatalogItems: CatalogItemRecord[] = [
  {
    id: randomUUID(),
    groupNameBn: 'শস্য ও তেল',
    groupNameEn: 'Grains & Oils',
    itemNameBn: 'চাল (নাজিরশাইল/মিনিকেট)',
    itemNameEn: 'Rice',
    defaultUnit: 'kg',
    sortOrder: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    groupNameBn: 'শস্য ও তেল',
    groupNameEn: 'Grains & Oils',
    itemNameBn: 'সয়াবিন তেল',
    itemNameEn: 'Soybean oil',
    defaultUnit: 'liter',
    sortOrder: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    groupNameBn: 'প্রোটিন ও ডেইরি',
    groupNameEn: 'Protein & Dairy',
    itemNameBn: 'ডিম',
    itemNameEn: 'Egg',
    defaultUnit: 'pcs',
    sortOrder: 100,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    groupNameBn: 'প্রোটিন ও ডেইরি',
    groupNameEn: 'Protein & Dairy',
    itemNameBn: 'মুরগি',
    itemNameEn: 'Chicken',
    defaultUnit: 'kg',
    sortOrder: 110,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    groupNameBn: 'মসলা ও নিত্যপ্রয়োজনীয়',
    groupNameEn: 'Spices & Basics',
    itemNameBn: 'পেঁয়াজ',
    itemNameEn: 'Onion',
    defaultUnit: 'kg',
    sortOrder: 140,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    groupNameBn: 'সবজি ও ফল',
    groupNameEn: 'Produce & Fruits',
    itemNameBn: 'আলু',
    itemNameEn: 'Potato',
    defaultUnit: 'kg',
    sortOrder: 240,
    createdAt: new Date().toISOString(),
  },
];

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function now() {
  return new Date().toISOString();
}

function monthFromDate(date: string) {
  return date.slice(0, 7);
}

function previousMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}


function sum(values: number[]) {
  return roundMoney(values.reduce((total, value) => total + value, 0));
}

function createEmptyState(): DataState {
  return {
    users: [],
    categories: [],
    transactions: [],
    budgets: [],
    planTemplates: [],
    planItems: [],
    catalogItems: [...seedCatalogItems],
    loans: [],
    loanPayments: [],
    revokedJtis: [],
  };
}

function publicUser(user: UserRecord): PublicUser {
  const { passwordHash, resetTokenHash, resetTokenExpiresAt, ...safe } = user;
  return safe;
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export class FinanceStore {
  private state: DataState = createEmptyState();
  private writeQueue: Promise<void> = Promise.resolve();
  private mutationQueue: Promise<void> = Promise.resolve();

  private constructor(private readonly filePath: string) {}

  static async create(filePath: string) {
    const store = new FinanceStore(filePath);
    await store.load();
    return store;
  }

  private async load() {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsedCandidate = JSON.parse(raw) as Partial<DataState> | null;
      const parsed = parsedCandidate && typeof parsedCandidate === 'object' ? parsedCandidate : {};
      const catalogItems = safeArray<CatalogItemRecord>(parsed.catalogItems);
      this.state = {
        users: safeArray<UserRecord>(parsed.users),
        categories: safeArray<CategoryRecord>(parsed.categories),
        transactions: safeArray<TransactionRecord>(parsed.transactions),
        budgets: safeArray<BudgetRecord>(parsed.budgets),
        planTemplates: safeArray<PlanTemplateRecord>(parsed.planTemplates),
        planItems: safeArray<PlanItemRecord>(parsed.planItems),
        catalogItems: catalogItems.length > 0 ? catalogItems : [...seedCatalogItems],
        loans: safeArray<LoanRecord>(parsed.loans),
        loanPayments: safeArray<LoanPaymentRecord>(parsed.loanPayments),
        revokedJtis: safeArray<string>(parsed.revokedJtis),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      this.state = createEmptyState();
      await this.persist();
    }
  }

  private async persist() {
    await mkdir(dirname(this.filePath), { recursive: true });
    this.writeQueue = this.writeQueue.then(() => writeFile(this.filePath, JSON.stringify(this.state, null, 2), 'utf8'));
    await this.writeQueue;
  }

  private async mutate<T>(handler: () => T | Promise<T>) {
    let result: T | undefined;
    let failure: unknown;

    this.mutationQueue = this.mutationQueue.then(async () => {
      try {
        result = await handler();
        await this.persist();
      } catch (error) {
        failure = error;
      }
    });

    await this.mutationQueue;
    if (failure) {
      throw failure;
    }

    if (result === undefined) {
      return undefined as T;
    }

    return result;
  }

  private assertUniqueCategoryName(userId: string, name: string, excludeCategoryId?: string) {
    const duplicate = this.state.categories.find(
      (item) => item.userId === userId
        && item.id !== excludeCategoryId
        && item.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      throw new ApiError(409, 'CATEGORY_EXISTS', 'Category already exists');
    }
  }

  private assertUniqueBudget(userId: string, categoryId: string, month: string, excludeBudgetId?: string) {
    const duplicate = this.state.budgets.find(
      (item) => item.userId === userId
        && item.id !== excludeBudgetId
        && item.categoryId === categoryId
        && item.month === month,
    );

    if (duplicate) {
      throw new ApiError(409, 'BUDGET_EXISTS', 'Budget already exists for this category and month');
    }
  }

  async getBootstrapSummary() {
    return {
      users: this.state.users.length,
      categories: this.state.categories.length,
      transactions: this.state.transactions.length,
      budgets: this.state.budgets.length,
      planTemplates: this.state.planTemplates.length,
      planItems: this.state.planItems.length,
      catalogItems: this.state.catalogItems.length,
      loans: this.state.loans.length,
      loanPayments: this.state.loanPayments.length,
    };
  }

  async isTokenRevoked(jti: string) {
    return this.state.revokedJtis.includes(jti);
  }

  async revokeToken(jti: string) {
    return this.mutate(() => {
      if (!this.state.revokedJtis.includes(jti)) {
        this.state.revokedJtis.push(jti);
      }
    });
  }

  async createUser(input: SignupInput, passwordHash: string) {
    return this.mutate(() => {
      const existing = this.state.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
      if (existing) {
        throw new ApiError(409, 'EMAIL_EXISTS', 'Email is already registered');
      }

      const timestamp = now();
      const user: UserRecord = {
        id: randomUUID(),
        email: input.email.toLowerCase(),
        name: input.name,
        avatarUrl: null,
        currency: input.currency,
        createdAt: timestamp,
        updatedAt: timestamp,
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      };

      this.state.users.push(user);
      this.state.categories.push(
        ...starterCategories.map((item) => ({
          id: randomUUID(),
          userId: user.id,
          name: item.name,
          icon: item.icon,
          color: item.color,
          createdAt: timestamp,
          updatedAt: timestamp,
        })),
      );

      return publicUser(user);
    });
  }

  async findUserByEmail(email: string) {
    const user = this.state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    return user ?? null;
  }

  async findUserById(userId: string) {
    return this.state.users.find((user) => user.id === userId) ?? null;
  }

  async updateUser(userId: string, patch: ProfileUpdateInput) {
    return this.mutate(() => {
      const user = this.requireUser(userId);
      if (patch.name !== undefined) user.name = patch.name;
      if (patch.avatarUrl !== undefined) user.avatarUrl = patch.avatarUrl ?? null;
      if (patch.currency !== undefined) user.currency = patch.currency;
      user.updatedAt = now();
      return publicUser(user);
    });
  }

  async setResetToken(userId: string, token: string, expiresAt: string) {
    return this.mutate(() => {
      const user = this.requireUser(userId);
      user.resetTokenHash = sha256(token);
      user.resetTokenExpiresAt = expiresAt;
    });
  }

  async resetPassword(input: ResetPasswordInput) {
    return this.mutate(() => {
      const tokenHash = sha256(input.token);
      const user = this.state.users.find((item) => item.resetTokenHash === tokenHash);
      if (!user || !user.resetTokenExpiresAt || new Date(user.resetTokenExpiresAt).getTime() < Date.now()) {
        throw new ApiError(400, 'INVALID_RESET_TOKEN', 'Reset token is invalid or expired');
      }
      user.passwordHash = input.password;
      user.resetTokenHash = null;
      user.resetTokenExpiresAt = null;
      user.updatedAt = now();
      return publicUser(user);
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.mutate(() => {
      const user = this.requireUser(userId);
      user.passwordHash = passwordHash;
      user.updatedAt = now();
      return publicUser(user);
    });
  }

  async findUserByResetToken(token: string) {
    const tokenHash = sha256(token);
    return this.state.users.find((user) => user.resetTokenHash === tokenHash) ?? null;
  }

  async listCategories(userId: string) {
    return this.state.categories.filter((category) => category.userId === userId).sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async getCategory(userId: string, id: string) {
    const category = this.state.categories.find((item) => item.userId === userId && item.id === id);
    if (!category) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
    return category;
  }

  async createCategory(userId: string, input: CategoryCreateInput) {
    return this.mutate(() => {
      this.assertUniqueCategoryName(userId, input.name);

      const timestamp = now();
      const category: CategoryRecord = {
        id: randomUUID(),
        userId,
        name: input.name,
        icon: input.icon,
        color: input.color,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.categories.push(category);
      return category;
    });
  }

  async updateCategory(userId: string, id: string, patch: CategoryUpdateInput) {
    return this.mutate(() => {
      const category = this.getCategorySync(userId, id);
      const nextName = patch.name ?? category.name;
      this.assertUniqueCategoryName(userId, nextName, id);
      if (patch.name !== undefined) category.name = patch.name;
      if (patch.icon !== undefined) category.icon = patch.icon;
      if (patch.color !== undefined) category.color = patch.color;
      category.updatedAt = now();
      return category;
    });
  }

  async deleteCategory(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.categories.findIndex((item) => item.userId === userId && item.id === id);
      if (index === -1) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');

      const categoryId = this.state.categories[index].id;
      const inUse = this.state.transactions.some((transaction) => transaction.userId === userId && transaction.categoryId === categoryId)
        || this.state.budgets.some((budget) => budget.userId === userId && budget.categoryId === categoryId)
        || this.state.planItems.some((item) => item.userId === userId && item.categoryId === categoryId);
      if (inUse) throw new ApiError(409, 'CATEGORY_IN_USE', 'Category is referenced by another record');

      this.state.categories.splice(index, 1);
    });
  }

  async listTransactions(userId: string, filters: TransactionFilters) {
    const items = this.state.transactions
      .filter((transaction) => transaction.userId === userId)
      .filter((transaction) => (filters.type ? transaction.type === filters.type : true))
      .filter((transaction) => (filters.categoryId ? transaction.categoryId === filters.categoryId : true))
      .filter((transaction) => (filters.startDate ? transaction.date >= filters.startDate : true))
      .filter((transaction) => (filters.endDate ? transaction.date <= filters.endDate : true))
      .sort((left, right) => {
        if (left.date !== right.date) return right.date.localeCompare(left.date);
        return right.createdAt.localeCompare(left.createdAt);
      });

    return items.slice(filters.offset, filters.offset + filters.limit).map((transaction) => this.hydrateTransaction(transaction));
  }

  async getTransaction(userId: string, id: string) {
    const transaction = this.getTransactionSync(userId, id);
    return this.hydrateTransaction(transaction);
  }

  async createTransaction(userId: string, input: TransactionCreateInput) {
    return this.mutate(() => {
      this.requireCategory(userId, input.categoryId);
      const timestamp = now();
      const transaction: TransactionRecord = {
        id: randomUUID(),
        userId,
        amount: roundMoney(input.amount),
        type: input.type,
        categoryId: input.categoryId,
        note: input.note ?? null,
        date: input.date,
        isRecurring: input.isRecurring,
        recurringType: input.recurringType,
        tags: input.tags ?? [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.transactions.push(transaction);
      return this.hydrateTransaction(transaction);
    });
  }

  async updateTransaction(userId: string, id: string, patch: TransactionUpdateInput) {
    return this.mutate(() => {
      const transaction = this.getTransactionSync(userId, id);
      if (patch.categoryId !== undefined) this.requireCategory(userId, patch.categoryId);
      if (patch.amount !== undefined) transaction.amount = roundMoney(patch.amount);
      if (patch.type !== undefined) transaction.type = patch.type;
      if (patch.categoryId !== undefined) transaction.categoryId = patch.categoryId;
      if (patch.note !== undefined) transaction.note = patch.note ?? null;
      if (patch.date !== undefined) transaction.date = patch.date;
      if (patch.isRecurring !== undefined) transaction.isRecurring = patch.isRecurring;
      if (patch.recurringType !== undefined) transaction.recurringType = patch.recurringType;
      if (patch.tags !== undefined) transaction.tags = patch.tags;
      transaction.updatedAt = now();
      return this.hydrateTransaction(transaction);
    });
  }

  async deleteTransaction(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.transactions.findIndex((item) => item.userId === userId && item.id === id);
      if (index === -1) throw new ApiError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
      this.state.transactions.splice(index, 1);
    });
  }

  async listBudgets(userId: string, filters: { month?: string }) {
    return this.state.budgets
      .filter((budget) => budget.userId === userId)
      .filter((budget) => (filters.month ? budget.month === filters.month : true))
      .sort((left, right) => right.month.localeCompare(left.month))
      .map((budget) => this.hydrateBudget(budget));
  }

  async getBudget(userId: string, id: string) {
    return this.hydrateBudget(this.getBudgetSync(userId, id));
  }

  async createBudget(userId: string, input: BudgetCreateInput) {
    return this.mutate(() => {
      this.requireCategory(userId, input.categoryId);
      this.assertUniqueBudget(userId, input.categoryId, input.month);

      const timestamp = now();
      const budget: BudgetRecord = {
        id: randomUUID(),
        userId,
        categoryId: input.categoryId,
        limitAmount: roundMoney(input.limitAmount),
        month: input.month,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.budgets.push(budget);
      return this.hydrateBudget(budget);
    });
  }

  async updateBudget(userId: string, id: string, patch: BudgetUpdateInput) {
    return this.mutate(() => {
      const budget = this.getBudgetSync(userId, id);
      const nextCategoryId = patch.categoryId ?? budget.categoryId;
      const nextMonth = patch.month ?? budget.month;
      if (patch.categoryId !== undefined) this.requireCategory(userId, nextCategoryId);
      this.assertUniqueBudget(userId, nextCategoryId, nextMonth, id);
      if (patch.categoryId !== undefined) budget.categoryId = patch.categoryId;
      if (patch.limitAmount !== undefined) budget.limitAmount = roundMoney(patch.limitAmount);
      if (patch.month !== undefined) budget.month = patch.month;
      budget.updatedAt = now();
      return this.hydrateBudget(budget);
    });
  }

  async deleteBudget(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.budgets.findIndex((item) => item.userId === userId && item.id === id);
      if (index === -1) throw new ApiError(404, 'BUDGET_NOT_FOUND', 'Budget not found');
      this.state.budgets.splice(index, 1);
    });
  }

  async listTemplates(userId: string, filters: { month?: string }) {
    return this.state.planTemplates
      .filter((template) => template.userId === userId)
      .filter((template) => (filters.month ? template.month === filters.month : true))
      .sort((left, right) => right.month.localeCompare(left.month))
      .map((template) => this.hydrateTemplate(template));
  }

  async getTemplate(userId: string, id: string) {
    return this.hydrateTemplate(this.getTemplateSync(userId, id));
  }

  async createTemplate(userId: string, input: TemplateCreateInput) {
    return this.mutate(() => {
      const timestamp = now();
      const template: PlanTemplateRecord = {
        id: randomUUID(),
        userId,
        name: input.name,
        month: input.month,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.planTemplates.push(template);
      return this.hydrateTemplate(template);
    });
  }

  async updateTemplate(userId: string, id: string, patch: TemplateUpdateInput) {
    return this.mutate(() => {
      const template = this.getTemplateSync(userId, id);
      if (patch.name !== undefined) template.name = patch.name;
      if (patch.month !== undefined) template.month = patch.month;
      template.updatedAt = now();
      return this.hydrateTemplate(template);
    });
  }

  async deleteTemplate(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.planTemplates.findIndex((item) => item.userId === userId && item.id === id);
      if (index === -1) throw new ApiError(404, 'TEMPLATE_NOT_FOUND', 'Template not found');
      const templateId = this.state.planTemplates[index].id;
      this.state.planItems = this.state.planItems.filter((item) => !(item.userId === userId && item.templateId === templateId));
      this.state.planTemplates.splice(index, 1);
    });
  }

  async listPlanItems(userId: string, filters: { templateId?: string; purchased?: 'true' | 'false' }) {
    return this.state.planItems
      .filter((item) => item.userId === userId)
      .filter((item) => (filters.templateId ? item.templateId === filters.templateId : true))
      .filter((item) => (filters.purchased === undefined ? true : item.isPurchased === (filters.purchased === 'true')))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((item) => this.hydratePlanItem(item));
  }

  async getPlanItem(userId: string, id: string) {
    return this.hydratePlanItem(this.getPlanItemSync(userId, id));
  }

  async createPlanItem(userId: string, input: PlanItemCreateInput) {
    return this.mutate(() => {
      this.requireTemplate(userId, input.templateId);
      if (input.categoryId) this.requireCategory(userId, input.categoryId);
      const timestamp = now();
      const item: PlanItemRecord = {
        id: randomUUID(),
        userId,
        templateId: input.templateId,
        categoryId: input.categoryId ?? null,
        name: input.name,
        quantity: roundMoney(input.quantity),
        unit: input.unit,
        estimatedPrice: roundMoney(input.estimatedPrice),
        isPurchased: false,
        purchasedAt: null,
        purchasedTransactionId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.planItems.push(item);
      return this.hydratePlanItem(item);
    });
  }

  async updatePlanItem(userId: string, id: string, patch: PlanItemUpdateInput) {
    return this.mutate(() => {
      const item = this.getPlanItemSync(userId, id);
      if (patch.templateId !== undefined) this.requireTemplate(userId, patch.templateId);
      if (patch.categoryId !== undefined && patch.categoryId !== null) this.requireCategory(userId, patch.categoryId);
      if (patch.templateId !== undefined) item.templateId = patch.templateId;
      if (patch.categoryId !== undefined) item.categoryId = patch.categoryId ?? null;
      if (patch.name !== undefined) item.name = patch.name;
      if (patch.quantity !== undefined) item.quantity = roundMoney(patch.quantity);
      if (patch.unit !== undefined) item.unit = patch.unit;
      if (patch.estimatedPrice !== undefined) item.estimatedPrice = roundMoney(patch.estimatedPrice);
      item.updatedAt = now();
      return this.hydratePlanItem(item);
    });
  }

  async deletePlanItem(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.planItems.findIndex((item) => item.userId === userId && item.id === id);
      if (index === -1) throw new ApiError(404, 'PLAN_ITEM_NOT_FOUND', 'Plan item not found');
      this.state.planItems.splice(index, 1);
    });
  }

  async togglePlanItemPurchased(userId: string, id: string, input: TogglePurchasedInput) {
    return this.mutate(() => {
      const item = this.getPlanItemSync(userId, id);
      const nextValue = input.checked ?? !item.isPurchased;
      item.isPurchased = nextValue;
      item.purchasedAt = nextValue ? now() : null;
      item.purchasedTransactionId = nextValue ? item.purchasedTransactionId : null;
      item.updatedAt = now();
      return this.hydratePlanItem(item);
    });
  }

  async listCatalog(filters: CatalogFilters) {
    const items = this.state.catalogItems
      .filter((item) => (filters.groupNameBn ? item.groupNameBn === filters.groupNameBn : true))
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .slice(filters.offset, filters.offset + filters.limit);
    return items;
  }

  async getCatalogItem(id: string) {
    const item = this.state.catalogItems.find((entry) => entry.id === id);
    if (!item) throw new ApiError(404, 'CATALOG_ITEM_NOT_FOUND', 'Catalog item not found');
    return item;
  }

  async createCatalogItem(input: CatalogCreateInput) {
    return this.mutate(() => {
      const item: CatalogItemRecord = {
        id: randomUUID(),
        groupNameBn: input.groupNameBn,
        groupNameEn: input.groupNameEn,
        itemNameBn: input.itemNameBn,
        itemNameEn: input.itemNameEn ?? null,
        defaultUnit: input.defaultUnit,
        sortOrder: input.sortOrder,
        createdAt: now(),
      };
      this.state.catalogItems.push(item);
      return item;
    });
  }

  async updateCatalogItem(id: string, patch: CatalogUpdateInput) {
    return this.mutate(() => {
      const item = this.state.catalogItems.find((entry) => entry.id === id);
      if (!item) throw new ApiError(404, 'CATALOG_ITEM_NOT_FOUND', 'Catalog item not found');
      if (patch.groupNameBn !== undefined) item.groupNameBn = patch.groupNameBn;
      if (patch.groupNameEn !== undefined) item.groupNameEn = patch.groupNameEn;
      if (patch.itemNameBn !== undefined) item.itemNameBn = patch.itemNameBn;
      if (patch.itemNameEn !== undefined) item.itemNameEn = patch.itemNameEn ?? null;
      if (patch.defaultUnit !== undefined) item.defaultUnit = patch.defaultUnit;
      if (patch.sortOrder !== undefined) item.sortOrder = patch.sortOrder;
      return item;
    });
  }

  async deleteCatalogItem(id: string) {
    return this.mutate(() => {
      const index = this.state.catalogItems.findIndex((entry) => entry.id === id);
      if (index === -1) throw new ApiError(404, 'CATALOG_ITEM_NOT_FOUND', 'Catalog item not found');
      this.state.catalogItems.splice(index, 1);
    });
  }

  async listLoans(userId: string, filters: { status?: LoanRecord['status'] }) {
    return this.state.loans
      .filter((loan) => loan.userId === userId)
      .filter((loan) => (filters.status ? loan.status === filters.status : true))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async getLoan(userId: string, id: string) {
    return this.getLoanSync(userId, id);
  }

  async createLoan(userId: string, input: LoanCreateInput) {
    return this.mutate(() => {
      const timestamp = now();
      const loan: LoanRecord = {
        id: randomUUID(),
        userId,
        name: input.name,
        totalAmount: roundMoney(input.totalAmount),
        interestRate: roundMoney(input.interestRate),
        monthlyInstallment: roundMoney(input.monthlyInstallment),
        startDate: input.startDate,
        dueDay: input.dueDay ?? null,
        status: input.status,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.loans.push(loan);
      return loan;
    });
  }

  async updateLoan(userId: string, id: string, patch: LoanUpdateInput) {
    return this.mutate(() => {
      const loan = this.getLoanSync(userId, id);
      if (patch.name !== undefined) loan.name = patch.name;
      if (patch.totalAmount !== undefined) loan.totalAmount = roundMoney(patch.totalAmount);
      if (patch.interestRate !== undefined) loan.interestRate = roundMoney(patch.interestRate);
      if (patch.monthlyInstallment !== undefined) loan.monthlyInstallment = roundMoney(patch.monthlyInstallment);
      if (patch.startDate !== undefined) loan.startDate = patch.startDate;
      if (patch.dueDay !== undefined) loan.dueDay = patch.dueDay ?? null;
      if (patch.status !== undefined) loan.status = patch.status;
      loan.updatedAt = now();
      return loan;
    });
  }

  async deleteLoan(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.loans.findIndex((loan) => loan.userId === userId && loan.id === id);
      if (index === -1) throw new ApiError(404, 'LOAN_NOT_FOUND', 'Loan not found');
      this.state.loanPayments = this.state.loanPayments.filter((payment) => !(payment.userId === userId && payment.loanId === id));
      this.state.loans.splice(index, 1);
    });
  }

  async listLoanPayments(userId: string, filters: { loanId?: string }) {
    return this.state.loanPayments
      .filter((payment) => payment.userId === userId)
      .filter((payment) => (filters.loanId ? payment.loanId === filters.loanId : true))
      .sort((left, right) => right.paidOn.localeCompare(left.paidOn));
  }

  async getLoanPayment(userId: string, id: string) {
    const payment = this.state.loanPayments.find((entry) => entry.userId === userId && entry.id === id);
    if (!payment) throw new ApiError(404, 'LOAN_PAYMENT_NOT_FOUND', 'Loan payment not found');
    return payment;
  }

  async createLoanPayment(userId: string, input: LoanPaymentCreateInput) {
    return this.mutate(() => {
      this.getLoanSync(userId, input.loanId);
      const timestamp = now();
      const payment: LoanPaymentRecord = {
        id: randomUUID(),
        userId,
        loanId: input.loanId,
        amount: roundMoney(input.amount),
        paidOn: input.paidOn,
        note: input.note ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.state.loanPayments.push(payment);
      return payment;
    });
  }

  async updateLoanPayment(userId: string, id: string, patch: LoanPaymentUpdateInput) {
    return this.mutate(() => {
      const payment = this.state.loanPayments.find((entry) => entry.userId === userId && entry.id === id);
      if (!payment) throw new ApiError(404, 'LOAN_PAYMENT_NOT_FOUND', 'Loan payment not found');
      if (patch.loanId !== undefined) this.getLoanSync(userId, patch.loanId);
      if (patch.loanId !== undefined) payment.loanId = patch.loanId;
      if (patch.amount !== undefined) payment.amount = roundMoney(patch.amount);
      if (patch.paidOn !== undefined) payment.paidOn = patch.paidOn;
      if (patch.note !== undefined) payment.note = patch.note ?? null;
      payment.updatedAt = now();
      return payment;
    });
  }

  async deleteLoanPayment(userId: string, id: string) {
    return this.mutate(() => {
      const index = this.state.loanPayments.findIndex((payment) => payment.userId === userId && payment.id === id);
      if (index === -1) throw new ApiError(404, 'LOAN_PAYMENT_NOT_FOUND', 'Loan payment not found');
      this.state.loanPayments.splice(index, 1);
    });
  }

  async getDashboard(userId: string) {
    const transactions = this.state.transactions.filter((transaction) => transaction.userId === userId);
    const categories = await this.listCategories(userId);
    const transactionsWithCategory = transactions.map((transaction) => this.hydrateTransaction(transaction));
    const balance = sum(
      transactions.map((transaction) => (transaction.type === 'income' ? transaction.amount : -transaction.amount)),
    );
    const totalIncome = sum(transactions.filter((transaction) => transaction.type === 'income').map((transaction) => transaction.amount));
    const totalExpense = sum(transactions.filter((transaction) => transaction.type === 'expense').map((transaction) => transaction.amount));

    const nowDate = new Date();
    const currentMonth = nowDate.toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter((transaction) => monthFromDate(transaction.date) === currentMonth);
    const monthlyIncome = sum(currentMonthTransactions.filter((transaction) => transaction.type === 'income').map((transaction) => transaction.amount));
    const monthlyExpense = sum(currentMonthTransactions.filter((transaction) => transaction.type === 'expense').map((transaction) => transaction.amount));

    const recentTransactions = transactionsWithCategory.slice(0, 5);

    const categoryBreakdown = categories
      .map((category) => ({
        name: category.name,
        value: sum(
          transactions
            .filter((transaction) => transaction.categoryId === category.id && transaction.type === 'expense')
            .map((transaction) => transaction.amount),
        ),
        color: category.color,
      }))
      .filter((item) => item.value > 0);

    const trend = Array.from({ length: 6 }, (_, index) => {
      const cursor = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth() - (5 - index), 1));
      const month = cursor.toISOString().slice(0, 7);
      const monthTransactions = transactions.filter((transaction) => monthFromDate(transaction.date) === month);
      return {
        month,
        income: sum(monthTransactions.filter((transaction) => transaction.type === 'income').map((transaction) => transaction.amount)),
        expense: sum(monthTransactions.filter((transaction) => transaction.type === 'expense').map((transaction) => transaction.amount)),
      };
    });

    const monthTemplates = this.state.planTemplates.filter((template) => template.userId === userId && template.month === currentMonth);
    const currentTemplateIds = monthTemplates.map((template) => template.id);
    const currentItems = this.state.planItems.filter((item) => item.userId === userId && currentTemplateIds.includes(item.templateId));
    const previousMonthValue = previousMonth(currentMonth);
    const previousTemplateIds = this.state.planTemplates.filter((template) => template.userId === userId && template.month === previousMonthValue).map((template) => template.id);
    const previousItems = this.state.planItems.filter((item) => item.userId === userId && previousTemplateIds.includes(item.templateId));

    const planSummary = {
      planned: sum(currentItems.map((item) => item.estimatedPrice)),
      spent: sum(currentItems.filter((item) => item.isPurchased).map((item) => item.estimatedPrice)),
      previousSpent: sum(previousItems.filter((item) => item.isPurchased).map((item) => item.estimatedPrice)),
      completion: currentItems.length === 0 ? 0 : roundMoney((currentItems.filter((item) => item.isPurchased).length / currentItems.length) * 100),
      purchasedCount: currentItems.filter((item) => item.isPurchased).length,
      itemCount: currentItems.length,
    };

    const loans = this.state.loans.filter((loan) => loan.userId === userId);
    const loanPayments = this.state.loanPayments.filter((payment) => payment.userId === userId);
    const totalPayable = sum(loans.map((loan) => loan.totalAmount + (loan.totalAmount * loan.interestRate) / 100));
    const totalPaid = sum(loanPayments.map((payment) => payment.amount));
    const currentMonthPaid = sum(loanPayments.filter((payment) => monthFromDate(payment.paidOn) === currentMonth).map((payment) => payment.amount));
    const previousMonthPaid = sum(loanPayments.filter((payment) => monthFromDate(payment.paidOn) === previousMonthValue).map((payment) => payment.amount));
    const monthlyDue = sum(loans.filter((loan) => loan.status === 'active').map((loan) => loan.monthlyInstallment));
    const totalRemaining = roundMoney(Math.max(totalPayable - totalPaid, 0));

    return {
      balance,
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
      recentTransactions,
      categoryBreakdown,
      trend,
      planSummary,
      loanSummary: {
        activeLoans: loans.filter((loan) => loan.status === 'active').length,
        totalPayable,
        totalPaid,
        totalRemaining,
        monthlyDue,
        currentMonthPaid,
        previousMonthPaid,
      },
    };
  }

  async getReportSummary(userId: string, filters: ReportFilters) {
    const transactions = this.state.transactions
      .filter((transaction) => transaction.userId === userId)
      .filter((transaction) => (filters.type === 'all' ? true : transaction.type === filters.type))
      .filter((transaction) => (filters.categoryId ? transaction.categoryId === filters.categoryId : true))
      .filter((transaction) => (filters.startDate ? transaction.date >= filters.startDate : true))
      .filter((transaction) => (filters.endDate ? transaction.date <= filters.endDate : true))
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, filters.limit)
      .map((transaction) => this.hydrateTransaction(transaction));

    const summary = {
      income: sum(transactions.filter((transaction) => transaction.type === 'income').map((transaction) => transaction.amount)),
      expense: sum(transactions.filter((transaction) => transaction.type === 'expense').map((transaction) => transaction.amount)),
      balance: 0,
      count: transactions.length,
    };
    summary.balance = roundMoney(summary.income - summary.expense);

    return { transactions, summary };
  }

  private hydrateTransaction(transaction: TransactionRecord) {
    return {
      ...transaction,
      category: this.state.categories.find((category) => category.id === transaction.categoryId) ?? null,
    };
  }

  private hydrateBudget(budget: BudgetRecord) {
    return {
      ...budget,
      category: this.state.categories.find((category) => category.id === budget.categoryId) ?? null,
    };
  }

  private hydratePlanItem(item: PlanItemRecord) {
    return {
      ...item,
      category: item.categoryId ? this.state.categories.find((category) => category.id === item.categoryId) ?? null : null,
      template: this.state.planTemplates.find((template) => template.id === item.templateId) ?? null,
    };
  }

  private hydrateTemplate(template: PlanTemplateRecord) {
    return {
      ...template,
      items: this.state.planItems.filter((item) => item.templateId === template.id).map((item) => this.hydratePlanItem(item)),
    };
  }

  private getUserSync(userId: string) {
    const user = this.state.users.find((item) => item.id === userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
  }

  private requireUser(userId: string) {
    return this.getUserSync(userId);
  }

  private getCategorySync(userId: string, id: string) {
    const category = this.state.categories.find((item) => item.userId === userId && item.id === id);
    if (!category) throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
    return category;
  }

  private requireCategory(userId: string, id: string) {
    return this.getCategorySync(userId, id);
  }

  private getTransactionSync(userId: string, id: string) {
    const transaction = this.state.transactions.find((item) => item.userId === userId && item.id === id);
    if (!transaction) throw new ApiError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    return transaction;
  }

  private getBudgetSync(userId: string, id: string) {
    const budget = this.state.budgets.find((item) => item.userId === userId && item.id === id);
    if (!budget) throw new ApiError(404, 'BUDGET_NOT_FOUND', 'Budget not found');
    return budget;
  }

  private getTemplateSync(userId: string, id: string) {
    const template = this.state.planTemplates.find((item) => item.userId === userId && item.id === id);
    if (!template) throw new ApiError(404, 'TEMPLATE_NOT_FOUND', 'Template not found');
    return template;
  }

  private requireTemplate(userId: string, id: string) {
    return this.getTemplateSync(userId, id);
  }

  private getPlanItemSync(userId: string, id: string) {
    const item = this.state.planItems.find((entry) => entry.userId === userId && entry.id === id);
    if (!item) throw new ApiError(404, 'PLAN_ITEM_NOT_FOUND', 'Plan item not found');
    return item;
  }

  private getLoanSync(userId: string, id: string) {
    const loan = this.state.loans.find((item) => item.userId === userId && item.id === id);
    if (!loan) throw new ApiError(404, 'LOAN_NOT_FOUND', 'Loan not found');
    return loan;
  }
}

