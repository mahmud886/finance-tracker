"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Category, Transaction } from "@/types/app";

type Props = {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
};

export function ReportTools({ transactions, categories, currency }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;
      if (categoryId !== "all" && tx.category_id !== categoryId) return false;
      if (type !== "all" && tx.type !== type) return false;
      return true;
    });
  }, [transactions, startDate, endDate, categoryId, type]);

  const summary = useMemo(() => {
    const income = filtered.filter((tx) => tx.type === "income").reduce((s, tx) => s + Number(tx.amount), 0);
    const expense = filtered.filter((tx) => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount), 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const onExportCsv = () => {
    const csv = Papa.unparse(
      filtered.map((tx) => ({
        date: tx.date,
        category: tx.category?.name ?? "Uncategorized",
        type: tx.type,
        amount: tx.amount,
        note: tx.note ?? "",
      })),
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finance-report.csv";
    link.click();
  };

  const onExportPdf = () => {
    const doc = new jsPDF();
    doc.text("Finance Report", 14, 16);
    autoTable(doc, {
      head: [["Date", "Category", "Type", "Amount", "Note"]],
      body: filtered.map((tx) => [
        formatDate(tx.date),
        tx.category?.name ?? "Uncategorized",
        tx.type,
        formatCurrency(Number(tx.amount), currency),
        tx.note ?? "",
      ]),
      startY: 24,
    });
    doc.save("finance-report.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-5">
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
        <div className="flex gap-2">
          <Button type="button" onClick={onExportCsv} variant="outline">
            Export CSV
          </Button>
          <Button type="button" onClick={onExportPdf} variant="outline">
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="text-lg font-semibold text-emerald-600">{formatCurrency(summary.income, currency)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-sm text-muted-foreground">Expense</p>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(summary.expense, currency)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.balance, currency)}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
        {filtered.length} transactions in this report.
      </div>
    </div>
  );
}

