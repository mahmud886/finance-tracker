"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import type { Budget } from "@/types/app";

export function BudgetAlerts({ budgets }: { budgets: Budget[] }) {
  useEffect(() => {
    budgets.forEach((budget) => {
      const spent = budget.spent ?? 0;
      const limit = Number(budget.limit_amount);
      const ratio = limit > 0 ? spent / limit : 0;

      if (ratio >= 1) {
        toast.error(`Budget exceeded: ${budget.category?.name ?? "Category"}`);
      } else if (ratio >= 0.9) {
        toast.warning(`Budget almost reached: ${budget.category?.name ?? "Category"}`);
      }
    });
  }, [budgets]);

  return null;
}

