import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/forms/transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Badge } from "@/components/ui/badge";
import { getCategories, getProfile, getTransactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function TransactionsPage() {
  const [profile, categories, transactions] = await Promise.all([
    getProfile(),
    getCategories(),
    getTransactions(),
  ]);
  const incomeTotal = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const expenseTotal = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <>
      <Topbar title="Transactions" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHero
          eyebrow="Transactions"
          title="Capture every movement of money"
          description="Log income and expenses with a smoother editing flow, modern card surfaces, and a clearer overview of your cash activity."
          badges={
            <>
              <Badge className="bg-soft-accent text-soft-accent-foreground">{transactions.length} records</Badge>
              <Badge className="bg-status-income-bg text-status-income-fg">{formatCurrency(incomeTotal, profile.currency)} income</Badge>
              <Badge className="bg-status-expense-bg text-status-expense-fg">{formatCurrency(expenseTotal, profile.currency)} expense</Badge>
            </>
          }
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-1 transition-transform duration-200 hover:-translate-y-0.5">
            <CardTitle>Add Transaction</CardTitle>
            <div className="mt-4">
              <TransactionForm categories={categories} />
            </div>
          </Card>
          <div className="xl:col-span-2">
            <TransactionTable initialTransactions={transactions} currency={profile.currency} />
          </div>
        </div>
      </div>
    </>
  );
}

