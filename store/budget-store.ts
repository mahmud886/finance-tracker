"use client";

import { create } from "zustand";

import type { Budget } from "@/types/app";

type BudgetState = {
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  upsertBudget: (budget: Budget) => void;
  removeBudget: (budgetId: string) => void;
  resetBudgets: () => void;
};

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  upsertBudget: (budget) =>
    set((state) => ({ budgets: [budget, ...state.budgets.filter((item) => item.id !== budget.id)] })),
  removeBudget: (budgetId) => set((state) => ({ budgets: state.budgets.filter((item) => item.id !== budgetId) })),
  resetBudgets: () => set({ budgets: [] }),
}));

