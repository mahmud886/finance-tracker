"use client";

import { create } from "zustand";

import type { Loan, LoanPayment } from "@/types/app";

type LoanState = {
  loans: Loan[];
  paymentsByLoanId: Record<string, LoanPayment[]>;
  selectedLoanId: string | null;
  setLoans: (loans: Loan[]) => void;
  upsertLoan: (loan: Loan) => void;
  removeLoan: (loanId: string) => void;
  setLoanPayments: (loanId: string, payments: LoanPayment[]) => void;
  upsertLoanPayment: (payment: LoanPayment) => void;
  removeLoanPayment: (loanId: string, paymentId: string) => void;
  setSelectedLoan: (loanId: string | null) => void;
  resetLoans: () => void;
};

const initialLoanState = {
  loans: [],
  paymentsByLoanId: {},
  selectedLoanId: null,
};

export const useLoanStore = create<LoanState>((set) => ({
  ...initialLoanState,
  setLoans: (loans) => set({ loans }),
  upsertLoan: (loan) =>
    set((state) => ({
      loans: [loan, ...state.loans.filter((item) => item.id !== loan.id)],
    })),
  removeLoan: (loanId) =>
    set((state) => {
      const restPayments = Object.fromEntries(
        Object.entries(state.paymentsByLoanId).filter(([id]) => id !== loanId),
      );
      return {
        loans: state.loans.filter((item) => item.id !== loanId),
        paymentsByLoanId: restPayments,
        selectedLoanId: state.selectedLoanId === loanId ? null : state.selectedLoanId,
      };
    }),
  setLoanPayments: (loanId, payments) =>
    set((state) => ({
      paymentsByLoanId: {
        ...state.paymentsByLoanId,
        [loanId]: payments,
      },
    })),
  upsertLoanPayment: (payment) =>
    set((state) => {
      const current = state.paymentsByLoanId[payment.loan_id] ?? [];
      return {
        paymentsByLoanId: {
          ...state.paymentsByLoanId,
          [payment.loan_id]: [payment, ...current.filter((item) => item.id !== payment.id)],
        },
      };
    }),
  removeLoanPayment: (loanId, paymentId) =>
    set((state) => ({
      paymentsByLoanId: {
        ...state.paymentsByLoanId,
        [loanId]: (state.paymentsByLoanId[loanId] ?? []).filter((item) => item.id !== paymentId),
      },
    })),
  setSelectedLoan: (loanId) => set({ selectedLoanId: loanId }),
  resetLoans: () => set(initialLoanState),
}));


