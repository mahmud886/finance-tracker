"use client";

import { useMemo, useState } from "react";

import { Card, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { formatCurrency } from "@/lib/utils";
import type { Budget } from "@/types/app";

export function BudgetList({ budgets, currency }: { budgets: Budget[]; currency: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const totalPages = Math.max(1, Math.ceil(budgets.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBudgets = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return budgets.slice(start, start + pageSize);
  }, [budgets, pageSize, safePage]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paginatedBudgets.map((budget) => {
          const spent = budget.spent ?? 0;
          const limit = Number(budget.limit_amount);
          const ratio = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

          return (
            <Card key={budget.id}>
              <CardTitle>{budget.category?.name ?? "Category"}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{budget.month}</p>
              <p className="mt-2 text-sm">
                {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
              </p>
              <div className="mt-3 h-2 rounded bg-muted">
                <div
                  className={ratio >= 100 ? "h-2 rounded bg-red-500" : "h-2 rounded bg-emerald-500"}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </Card>
          );
        })}
        {budgets.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">No budgets configured for this month.</p>
          </Card>
        ) : null}
      </div>

      <PaginationControls
        totalItems={budgets.length}
        currentPage={safePage}
        pageSize={pageSize}
        onPageChangeAction={setCurrentPage}
        onPageSizeChangeAction={setPageSize}
        pageSizeOptions={[6, 9, 12]}
        itemLabel="budgets"
      />
    </div>
  );
}

