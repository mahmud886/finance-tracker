import { format } from "date-fns";

import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardTitle } from "@/components/ui/card";
import { BudgetForm } from "@/components/forms/budget-form";
import { BudgetList } from "@/components/budgets/budget-list";
import { Badge } from "@/components/ui/badge";
import { getBudgets, getCategories, getProfile } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function BudgetsPage() {
  const month = format(new Date(), "yyyy-MM");
  const [profile, categories, budgets] = await Promise.all([getProfile(), getCategories(), getBudgets(month)]);
  const totalLimit = budgets.reduce((sum, budget) => sum + Number(budget.limit_amount), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.spent ?? 0), 0);

  return (
    <>
      <Topbar title="Budgets" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHero
          eyebrow="Budgets"
          title="Keep spending within a calm monthly plan"
          description="Set category budgets, compare spending at a glance, and track whether your month is under control."
          badges={
            <>
              <Badge className="bg-soft-accent text-soft-accent-foreground">{budgets.length} budgets</Badge>
              <Badge className="bg-status-income-bg text-status-income-fg">{formatCurrency(totalSpent, profile.currency)} spent</Badge>
              <Badge className="bg-status-expense-bg text-status-expense-fg">{formatCurrency(totalLimit, profile.currency)} limit</Badge>
            </>
          }
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-1 transition-transform duration-200 hover:-translate-y-0.5">
            <CardTitle>Set Monthly Budget</CardTitle>
            <div className="mt-4">
              <BudgetForm categories={categories} />
            </div>
          </Card>
          <div className="space-y-4 xl:col-span-2">
            <BudgetList budgets={budgets} currency={profile.currency} />
          </div>
        </div>
      </div>
    </>
  );
}

