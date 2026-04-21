import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { FinanceStore } from '../src/store';

const tempDirs: string[] = [];

async function createTempStore() {
  const dir = await mkdtemp(join(tmpdir(), 'finance-store-invariants-'));
  tempDirs.push(dir);
  return FinanceStore.create(join(dir, 'data.json'));
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('FinanceStore invariants', () => {
  it('blocks category rename conflicts', async () => {
    const store = await createTempStore();
    const user = await store.createUser(
      { email: 'user@example.com', password: 'secret-1234', name: 'User', currency: 'USD' },
      'hash',
    );

    const categories = await store.listCategories(user.id);
    await expect(
      store.updateCategory(user.id, categories[0].id, { name: categories[1].name }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'CATEGORY_EXISTS' });
  });

  it('blocks budget conflicts on update', async () => {
    const store = await createTempStore();
    const user = await store.createUser(
      { email: 'budget@example.com', password: 'secret-1234', name: 'Budget User', currency: 'USD' },
      'hash',
    );

    const [first, second] = await store.listCategories(user.id);
    const budgetA = await store.createBudget(user.id, { categoryId: first.id, limitAmount: 500, month: '2026-04' });
    const budgetB = await store.createBudget(user.id, { categoryId: second.id, limitAmount: 300, month: '2026-04' });

    expect(budgetA.id).not.toBe(budgetB.id);
    await expect(
      store.updateBudget(user.id, budgetB.id, { categoryId: first.id }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'BUDGET_EXISTS' });
  });

  it('serializes concurrent category creation to prevent duplicate writes', async () => {
    const store = await createTempStore();
    const user = await store.createUser(
      { email: 'parallel@example.com', password: 'secret-1234', name: 'Parallel User', currency: 'USD' },
      'hash',
    );

    const attempts = await Promise.allSettled(
      Array.from({ length: 10 }, () => store.createCategory(user.id, {
        name: 'Utilities',
        icon: 'bolt',
        color: '#123abc',
      })),
    );

    const successCount = attempts.filter((item) => item.status === 'fulfilled').length;
    const conflictCount = attempts.filter(
      (item) => item.status === 'rejected' && (item.reason as { code?: string }).code === 'CATEGORY_EXISTS',
    ).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(9);
  });
});

