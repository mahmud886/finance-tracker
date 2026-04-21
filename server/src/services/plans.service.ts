import type {
  PlanItemCreateInput,
  PlanItemUpdateInput,
  TemplateCreateInput,
  TemplateUpdateInput,
  TogglePurchasedInput,
} from '../domain';
import type { AppContext } from '../types';

export class PlansService {
  constructor(private readonly context: AppContext) {}

  async listTemplates(userId: string, filters: { month?: string }) {
    return this.context.store.listTemplates(userId, filters);
  }

  async createTemplate(userId: string, input: TemplateCreateInput) {
    return this.context.store.createTemplate(userId, input);
  }

  async getTemplate(userId: string, id: string) {
    return this.context.store.getTemplate(userId, id);
  }

  async updateTemplate(userId: string, id: string, patch: TemplateUpdateInput) {
    return this.context.store.updateTemplate(userId, id, patch);
  }

  async deleteTemplate(userId: string, id: string) {
    await this.context.store.deleteTemplate(userId, id);
  }

  async listItems(userId: string, filters: { templateId?: string; purchased?: 'true' | 'false' }) {
    return this.context.store.listPlanItems(userId, filters);
  }

  async createItem(userId: string, input: PlanItemCreateInput) {
    return this.context.store.createPlanItem(userId, input);
  }

  async getItem(userId: string, id: string) {
    return this.context.store.getPlanItem(userId, id);
  }

  async updateItem(userId: string, id: string, patch: PlanItemUpdateInput) {
    return this.context.store.updatePlanItem(userId, id, patch);
  }

  async deleteItem(userId: string, id: string) {
    await this.context.store.deletePlanItem(userId, id);
  }

  async togglePurchased(userId: string, id: string, input: TogglePurchasedInput) {
    return this.context.store.togglePlanItemPurchased(userId, id, input);
  }
}

