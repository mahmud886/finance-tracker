import type {
  CatalogCreateInput,
  CatalogUpdateInput,
} from '../domain';
import type { AppContext } from '../types';

export class CatalogService {
  constructor(private readonly context: AppContext) {}

  async list(filters: { limit: number; offset: number; groupNameBn?: string }) {
    return this.context.store.listCatalog(filters);
  }

  async create(input: CatalogCreateInput) {
    return this.context.store.createCatalogItem(input);
  }

  async get(id: string) {
    return this.context.store.getCatalogItem(id);
  }

  async update(id: string, patch: CatalogUpdateInput) {
    return this.context.store.updateCatalogItem(id, patch);
  }

  async remove(id: string) {
    await this.context.store.deleteCatalogItem(id);
  }
}

