"use client";

import { create } from "zustand";

import type { BudgetTemplate, TemplateItem } from "@/types/app";

type PlanState = {
  templates: BudgetTemplate[];
  templateItemsByTemplateId: Record<string, TemplateItem[]>;
  activeTemplateId: string | null;
  setTemplates: (templates: BudgetTemplate[]) => void;
  upsertTemplate: (template: BudgetTemplate) => void;
  removeTemplate: (templateId: string) => void;
  setTemplateItems: (templateId: string, items: TemplateItem[]) => void;
  upsertTemplateItem: (item: TemplateItem) => void;
  removeTemplateItem: (templateId: string, itemId: string) => void;
  setActiveTemplate: (templateId: string | null) => void;
  resetPlans: () => void;
};

const initialPlanState = {
  templates: [],
  templateItemsByTemplateId: {},
  activeTemplateId: null,
};

export const usePlanStore = create<PlanState>((set) => ({
  ...initialPlanState,
  setTemplates: (templates) => set({ templates }),
  upsertTemplate: (template) =>
    set((state) => ({
      templates: [template, ...state.templates.filter((item) => item.id !== template.id)],
    })),
  removeTemplate: (templateId) =>
    set((state) => {
      const restItems = Object.fromEntries(
        Object.entries(state.templateItemsByTemplateId).filter(([id]) => id !== templateId),
      );
      return {
        templates: state.templates.filter((item) => item.id !== templateId),
        templateItemsByTemplateId: restItems,
        activeTemplateId: state.activeTemplateId === templateId ? null : state.activeTemplateId,
      };
    }),
  setTemplateItems: (templateId, items) =>
    set((state) => ({
      templateItemsByTemplateId: {
        ...state.templateItemsByTemplateId,
        [templateId]: items,
      },
    })),
  upsertTemplateItem: (item) =>
    set((state) => {
      const current = state.templateItemsByTemplateId[item.template_id] ?? [];
      return {
        templateItemsByTemplateId: {
          ...state.templateItemsByTemplateId,
          [item.template_id]: [item, ...current.filter((entry) => entry.id !== item.id)],
        },
      };
    }),
  removeTemplateItem: (templateId, itemId) =>
    set((state) => ({
      templateItemsByTemplateId: {
        ...state.templateItemsByTemplateId,
        [templateId]: (state.templateItemsByTemplateId[templateId] ?? []).filter((item) => item.id !== itemId),
      },
    })),
  setActiveTemplate: (templateId) => set({ activeTemplateId: templateId }),
  resetPlans: () => set(initialPlanState),
}));


