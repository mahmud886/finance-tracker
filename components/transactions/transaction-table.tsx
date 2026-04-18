"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { deleteTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/app";

type Props = {
  initialTransactions: Transaction[];
  currency: string;
};

export function TransactionTable({ initialTransactions, currency }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rows = useMemo(
    () => initialTransactions.filter((tx) => !deletedIds.includes(tx.id)),
    [deletedIds, initialTransactions],
  );

  useEffect(() => {
    const channel = supabase
      .channel("transactions-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [pageSize, rows, safePage]);

  const onDelete = (id: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", id);
        await deleteTransaction(formData);
        setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        toast.success("Transaction deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete transaction");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Note</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((tx) => (
              <tr key={tx.id} className="border-b transition-colors hover:bg-muted/45">
                <td className="p-3">{formatDate(tx.date)}</td>
                <td className="p-3">{tx.category?.name ?? "Uncategorized"}</td>
                <td className="p-3">
                  <Badge
                    className={
                      tx.type === "income"
                        ? "bg-status-income-bg text-status-income-fg"
                        : "bg-status-expense-bg text-status-expense-fg"
                    }
                  >
                    {tx.type}
                  </Badge>
                </td>
                <td className="p-3">{formatCurrency(Number(tx.amount), currency)}</td>
                <td className="p-3 text-muted-foreground">{tx.note ?? "-"}</td>
                <td className="p-3">
                  <Button size="sm" variant="danger" onClick={() => onDelete(tx.id)} disabled={isPending}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-muted-foreground" colSpan={6}>
                  No transactions found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <PaginationControls
        totalItems={rows.length}
        currentPage={safePage}
        pageSize={pageSize}
        onPageChangeAction={setCurrentPage}
        onPageSizeChangeAction={setPageSize}
        itemLabel="transactions"
      />
    </div>
  );
}

