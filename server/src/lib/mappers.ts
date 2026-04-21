import type { UserRecord, CategoryRecord, TransactionRecord, BudgetRecord } from '../domain';

export function mapUserToPublic(user: UserRecord) {
  const { passwordHash, resetTokenHash, resetTokenExpiresAt, ...safe } = user;
  return safe;
}

export function mapCategoryToView(category: CategoryRecord) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function mapTransactionToView(transaction: TransactionRecord & { category?: CategoryRecord | null }) {
  return {
    ...transaction,
    category: transaction.category ? mapCategoryToView(transaction.category) : null,
  };
}

export function mapBudgetToView(budget: BudgetRecord & { category?: CategoryRecord | null }) {
  return {
    ...budget,
    category: budget.category ? mapCategoryToView(budget.category) : null,
  };
}

export function mapBulk<T, U>(items: T[], mapper: (item: T) => U): U[] {
  return items.map(mapper);
}

export function partitionBy<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const match: T[] = [];
  const noMatch: T[] = [];

  for (const item of items) {
    if (predicate(item)) {
      match.push(item);
    } else {
      noMatch.push(item);
    }
  }

  return [match, noMatch];
}

