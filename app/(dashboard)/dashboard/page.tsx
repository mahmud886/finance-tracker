import { AnimatedSection } from "@/components/animated/animated-section";
import { SignOutButton } from "@/components/auth/signout-button";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RecurringReminders } from "@/components/dashboard/recurring-reminders";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Topbar } from "@/components/layout/topbar";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getBudgets, getProfile } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default async function DashboardPage() {
  const [profile, stats, budgets] = await Promise.all([getProfile(), getDashboardStats(), getBudgets()]);
  const todayLabel = format(new Date(), "EEEE, MMM d");
  const planProgress = Math.max(0, Math.min(100, stats.planSummary.completion));
  const loanRepaymentProgress =
    stats.loanSummary.totalPayable > 0 ? Math.max(0, Math.min(100, (stats.loanSummary.totalPaid / stats.loanSummary.totalPayable) * 100)) : 0;
  const planSpendRatio = stats.planSummary.planned > 0 ? (stats.planSummary.spent / stats.planSummary.planned) * 100 : 0;
  const planStatus = planSpendRatio > 100 ? "critical" : planSpendRatio > 85 ? "warning" : "healthy";
  const planStatusClass =
    planStatus === "critical"
      ? "bg-status-expense-bg text-status-expense-fg"
      : planStatus === "warning"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
        : "bg-status-income-bg text-status-income-fg";
  const planDelta = stats.planSummary.spent - stats.planSummary.previousSpent;
  const planDeltaPct = stats.planSummary.previousSpent > 0 ? (planDelta / stats.planSummary.previousSpent) * 100 : 0;
  const planTrend = planDelta > 0 ? "up" : planDelta < 0 ? "down" : "flat";

  const isLoanAtRisk =
    stats.loanSummary.activeLoans > 0 &&
    (stats.loanSummary.totalRemaining > stats.balance ||
      (stats.monthlyIncome > 0 && stats.loanSummary.monthlyDue > stats.monthlyIncome * 0.4));
  const loanPressureCurrent = Math.max(stats.loanSummary.monthlyDue - stats.loanSummary.currentMonthPaid, 0);
  const loanPressurePrevious = Math.max(stats.loanSummary.monthlyDue - stats.loanSummary.previousMonthPaid, 0);
  const loanPressureDelta = loanPressureCurrent - loanPressurePrevious;
  const loanPressureTrend = loanPressureDelta > 0 ? "up" : loanPressureDelta < 0 ? "down" : "flat";
  const emiPressureRatio = stats.monthlyIncome > 0 ? (stats.loanSummary.monthlyDue / stats.monthlyIncome) * 100 : 0;
  const emiPressureStatus = emiPressureRatio > 40 ? "critical" : emiPressureRatio > 25 ? "warning" : "healthy";
  const emiPressureClass =
    emiPressureStatus === "critical"
      ? "bg-status-expense-bg text-status-expense-fg"
      : emiPressureStatus === "warning"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
        : "bg-status-income-bg text-status-income-fg";

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="space-y-6 p-4 md:p-6">
        <Card className="overflow-hidden border border-border/80 bg-linear-to-br from-card via-card to-muted/30 shadow-(--shadow-md)">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-soft-accent text-soft-accent-foreground hover:bg-soft-accent">
                  <Sparkles size={12} className="mr-1" />
                  Overview
                </Badge>
                <Badge className="gap-1.5 border border-border/80 bg-muted/50 text-muted-foreground">
                  <CalendarDays size={12} />
                  {todayLabel}
                </Badge>
                <Badge className={isLoanAtRisk ? "bg-status-expense-bg text-status-expense-fg" : "bg-status-income-bg text-status-income-fg"}>
                  {isLoanAtRisk ? "Loan Alert" : "Healthy Cashflow"}
                </Badge>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Welcome back</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  {profile.name ? `Hey ${profile.name}` : "Hey there"}, here’s your finance snapshot.
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Track spending, progress, and loan pressure at a glance with a calmer, more interactive dashboard experience.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="flex flex-wrap gap-2">
                <Badge className="gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-muted-foreground">
                  {stats.planSummary.itemCount} plan items
                </Badge>
                <Badge className="gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-muted-foreground">
                  {stats.loanSummary.activeLoans} active loans
                </Badge>
                <Badge className="gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-muted-foreground">
                  {formatCurrency(stats.balance, profile.currency)} balance
                </Badge>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/80 px-3 py-2 shadow-(--shadow-sm)">
                <SignOutButton />
              </div>
            </div>
          </div>
        </Card>

        <AnimatedSection>
          <StatsGrid
            balance={stats.balance}
            totalIncome={stats.totalIncome}
            totalExpense={stats.totalExpense}
            monthlyIncome={stats.monthlyIncome}
            monthlyExpense={stats.monthlyExpense}
            currency={profile.currency}
          />
        </AnimatedSection>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 transition-transform duration-200 hover:-translate-y-0.5">
            <CardTitle>Income vs Expense Trend</CardTitle>
            <TrendLineChart data={stats.trend} />
          </Card>
          <Card className="transition-transform duration-200 hover:-translate-y-0.5">
            <CardTitle>Expense by Category</CardTitle>
            <SpendingPieChart data={stats.categoryBreakdown} />
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="transition-transform duration-200 hover:-translate-y-0.5">
            <CardTitle>Plan Expenses (This Month)</CardTitle>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.planSummary.planned, profile.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.planSummary.spent, profile.currency)}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {planTrend === "up" ? (
                    <ArrowUpRight size={14} className="text-red-500" />
                  ) : planTrend === "down" ? (
                    <ArrowDownRight size={14} className="text-emerald-500" />
                  ) : (
                    <ArrowRight size={14} className="text-muted-foreground" />
                  )}
                  {stats.planSummary.previousSpent > 0
                    ? `${planDelta >= 0 ? "+" : ""}${planDeltaPct.toFixed(1)}% vs last month`
                    : "No last-month baseline"}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-lg font-semibold">{stats.planSummary.completion.toFixed(0)}%</p>
                <Badge className={`mt-1 ${planStatusClass}`}>{planStatus === "critical" ? "Critical" : planStatus === "warning" ? "Warning" : "Healthy"}</Badge>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Purchased {stats.planSummary.purchasedCount} of {stats.planSummary.itemCount} checklist items.
            </p>
            <Progress value={planProgress} className="mt-3" />
          </Card>

          <Card className="transition-transform duration-200 hover:-translate-y-0.5">
            <CardTitle>Loan Summary</CardTitle>
            <div className="mt-3">
              <Badge className={isLoanAtRisk ? "bg-status-expense-bg text-status-expense-fg" : "bg-status-income-bg text-status-income-fg"}>
                {isLoanAtRisk ? "At Risk" : "Stable"}
              </Badge>
              <Badge className={`ml-2 ${emiPressureClass}`}>
                EMI Pressure: {emiPressureStatus === "critical" ? "Critical" : emiPressureStatus === "warning" ? "Warning" : "Healthy"}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-lg font-semibold">{stats.loanSummary.activeLoans}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly EMI Due</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.loanSummary.monthlyDue, profile.currency)}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {loanPressureTrend === "up" ? (
                    <ArrowUpRight size={14} className="text-red-500" />
                  ) : loanPressureTrend === "down" ? (
                    <ArrowDownRight size={14} className="text-emerald-500" />
                  ) : (
                    <ArrowRight size={14} className="text-muted-foreground" />
                  )}
                  {loanPressureDelta >= 0 ? "+" : ""}{formatCurrency(loanPressureDelta, profile.currency)} pressure vs last month
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.loanSummary.totalPaid, profile.currency)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.loanSummary.totalRemaining, profile.currency)}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Progress value={loanRepaymentProgress} />
              <p className="text-xs text-muted-foreground">Repayment progress: {loanRepaymentProgress.toFixed(1)}%</p>
            </div>
          </Card>
        </div>

        <RecentTransactions transactions={stats.recentTransactions} currency={profile.currency} />
        <BudgetAlerts budgets={budgets} />
        <RecurringReminders transactions={stats.recentTransactions} />
      </div>
    </>
  );
}
