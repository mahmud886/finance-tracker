import type {
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../domain';
import type { AppContext } from '../types';

export class CategoriesService {
  constructor(private readonly context: AppContext) {}

  async list(userId: string, limit: number, offset: number) {
    const rows = await this.context.store.listCategories(userId);
    return {
      data: rows.slice(offset, offset + limit),
      meta: { total: rows.length, limit, offset },
    };
  }

  async get(userId: string, id: string) {
    return this.context.store.getCategory(userId, id);
  }

  async create(userId: string, input: CategoryCreateInput) {
    return this.context.store.createCategory(userId, input);
  }

  async update(userId: string, id: string, patch: CategoryUpdateInput) {
    return this.context.store.updateCategory(userId, id, patch);
  }

  async remove(userId: string, id: string) {
    await this.context.store.deleteCategory(userId, id);
  }
}

