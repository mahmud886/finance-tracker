"use client";

import { create } from "zustand";

import type { Transaction } from "@/types/app";

type TransactionState = {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  upsertTransaction: (transaction: Transaction) => void;
  upsertTransactions: (transactions: Transaction[]) => void;
  removeTransaction: (transactionId: string) => void;
  resetTransactions: () => void;
};

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  upsertTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions.filter((item) => item.id !== transaction.id)],
    })),
  upsertTransactions: (transactions) =>
    set((state) => {
      const ids = new Set(transactions.map((item) => item.id));
      return {
        transactions: [...transactions, ...state.transactions.filter((item) => !ids.has(item.id))],
      };
    }),
  removeTransaction: (transactionId) =>
    set((state) => ({
      transactions: state.transactions.filter((item) => item.id !== transactionId),
    })),
  resetTransactions: () => set({ transactions: [] }),
}));

