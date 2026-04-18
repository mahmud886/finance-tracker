import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function StatsGrid({
  balance,
  totalIncome,
  totalExpense,
  monthlyIncome,
  monthlyExpense,
  currency,
}: {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  currency: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <Card className="transition-transform duration-200 hover:-translate-y-0.5">
        <CardTitle>Total Balance</CardTitle>
        <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(balance, currency)}</p>
      </Card>
      <Card className="transition-transform duration-200 hover:-translate-y-0.5">
        <CardTitle>Total Income</CardTitle>
        <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(totalIncome, currency)}</p>
      </Card>
      <Card className="transition-transform duration-200 hover:-translate-y-0.5">
        <CardTitle>Total Expense</CardTitle>
        <p className="mt-2 text-2xl font-bold tracking-tight text-red-600">{formatCurrency(totalExpense, currency)}</p>
      </Card>
      <Card className="transition-transform duration-200 hover:-translate-y-0.5">
        <CardTitle>Monthly Income</CardTitle>
        <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(monthlyIncome, currency)}</p>
      </Card>
      <Card className="transition-transform duration-200 hover:-translate-y-0.5">
        <CardTitle>Monthly Expense</CardTitle>
        <p className="mt-2 text-2xl font-bold tracking-tight text-red-600">{formatCurrency(monthlyExpense, currency)}</p>
      </Card>
    </div>
  );
}

