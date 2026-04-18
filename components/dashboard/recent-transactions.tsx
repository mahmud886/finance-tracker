"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/app";

export function RecentTransactions({
  transactions,
  currency,
}: {
  transactions: Transaction[];
  currency: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [pageSize, safePage, transactions]);

  return (
    <Card>
      <CardTitle>Recent Transactions</CardTitle>
      <div className="mt-4 space-y-3">
        {paginatedTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{transaction.category?.name ?? "Uncategorized"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
              {transaction.note ? <p className="text-xs text-muted-foreground">{transaction.note}</p> : null}
            </div>
            <div className="text-right">
              <Badge
                className={
                  transaction.type === "income"
                    ? "bg-status-income-bg text-status-income-fg"
                    : "bg-status-expense-bg text-status-expense-fg"
                }
              >
                {transaction.type}
              </Badge>
              <p className="mt-1 font-semibold">
                {formatCurrency(Number(transaction.amount), currency)}
              </p>
            </div>
          </div>
        ))}
        {transactions.length === 0 ? <p className="text-sm text-muted-foreground">No transactions yet.</p> : null}
      </div>
      <PaginationControls
        totalItems={transactions.length}
        currentPage={safePage}
        pageSize={pageSize}
        onPageChangeAction={setCurrentPage}
        onPageSizeChangeAction={setPageSize}
        pageSizeOptions={[5, 10, 15]}
        itemLabel="transactions"
      />
    </Card>
  );
}

