"use client";

import { useEffect } from "react";
import { addDays, isBefore, parseISO } from "date-fns";
import { toast } from "sonner";

import type { Transaction } from "@/types/app";

export function RecurringReminders({ transactions }: { transactions: Transaction[] }) {
  useEffect(() => {
    const now = new Date();
    const threshold = addDays(now, 3);

    transactions
      .filter((tx) => tx.is_recurring)
      .forEach((tx) => {
        const date = parseISO(tx.date);
        if (isBefore(date, threshold)) {
          toast.info(`Recurring payment reminder: ${tx.category?.name ?? "Transaction"}`);
        }
      });
  }, [transactions]);

  return null;
}

