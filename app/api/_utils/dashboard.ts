import { addMonths, format, startOfMonth, subMonths } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, Transaction } from "@/types/app";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getDashboardStatsForUser(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<DashboardStats> {
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (transactions ?? []) as Transaction[];
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthKey = format(now, "yyyy-MM");
  const previousMonthKey = format(subMonths(now, 1), "yyyy-MM");
  const previousMonthStart = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
  const nextMonthStart = format(startOfMonth(addMonths(now, 1)), "yyyy-MM-dd");

  let totalIncome = 0;
  let totalExpense = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  const categoryMap = new Map<string, { name: string; value: number; color: string }>();
  const trendMap = new Map<string, { month: string; income: number; expense: number }>();

  for (const tx of rows) {
    const amount = Number(tx.amount);
    const date = new Date(tx.date);
    const txMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!trendMap.has(txMonthKey)) {
      trendMap.set(txMonthKey, { month: txMonthKey, income: 0, expense: 0 });
    }

    const trendEntry = trendMap.get(txMonthKey)!;

    if (tx.type === "income") {
      totalIncome += amount;
      trendEntry.income += amount;
      if (date >= monthStart) {
        monthlyIncome += amount;
      }
      continue;
    }

    totalExpense += amount;
    trendEntry.expense += amount;

    if (date >= monthStart) {
      monthlyExpense += amount;
    }

    const categoryName = tx.category?.name ?? "Uncategorized";
    const categoryKey = tx.category_id;

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        name: categoryName,
        value: 0,
        color: tx.category?.color ?? "#64748b",
      });
    }

    categoryMap.get(categoryKey)!.value += amount;
  }

  const result: DashboardStats = {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    recentTransactions: rows.slice(0, 8),
    categoryBreakdown: Array.from(categoryMap.values()).sort((a, b) => b.value - a.value),
    trend: Array.from(trendMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6),
    planSummary: {
      planned: 0,
      spent: 0,
      previousSpent: 0,
      completion: 0,
      purchasedCount: 0,
      itemCount: 0,
    },
    loanSummary: {
      activeLoans: 0,
      totalPayable: 0,
      totalPaid: 0,
      totalRemaining: 0,
      monthlyDue: 0,
      currentMonthPaid: 0,
      previousMonthPaid: 0,
    },
  };

  const [{ data: templates }, { data: previousTemplates }, { data: loans }] = await Promise.all([
    supabase.from("budget_templates").select("id").eq("user_id", userId).eq("month", monthKey),
    supabase.from("budget_templates").select("id").eq("user_id", userId).eq("month", previousMonthKey),
    supabase
      .from("loans")
      .select("id, total_amount, interest_rate, monthly_installment")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const templateIds = (templates ?? []).map((item: { id: string }) => item.id);
  if (templateIds.length > 0) {
    const { data: templateItems } = await supabase
      .from("template_items")
      .select("estimated_price, is_purchased")
      .eq("user_id", userId)
      .in("template_id", templateIds);

    const items = templateItems ?? [];
    const planned = items.reduce((sum: number, item: { estimated_price: number }) => sum + Number(item.estimated_price), 0);
    const purchasedItems = items.filter((item: { is_purchased: boolean }) => item.is_purchased);
    const spent = purchasedItems.reduce(
      (sum: number, item: { estimated_price: number }) => sum + Number(item.estimated_price),
      0,
    );

    result.planSummary = {
      planned,
      spent,
      previousSpent: 0,
      completion: items.length > 0 ? (purchasedItems.length / items.length) * 100 : 0,
      purchasedCount: purchasedItems.length,
      itemCount: items.length,
    };
  }

  const previousTemplateIds = (previousTemplates ?? []).map((item: { id: string }) => item.id);
  if (previousTemplateIds.length > 0) {
    const { data: previousItems } = await supabase
      .from("template_items")
      .select("estimated_price, is_purchased")
      .eq("user_id", userId)
      .in("template_id", previousTemplateIds);

    result.planSummary.previousSpent = (previousItems ?? [])
      .filter((item: { is_purchased: boolean }) => item.is_purchased)
      .reduce((sum: number, item: { estimated_price: number }) => sum + Number(item.estimated_price), 0);
  }

  const activeLoans = loans ?? [];
  if (activeLoans.length > 0) {
    const loanIds = activeLoans.map((loan: { id: string }) => loan.id);
    const { data: payments } = await supabase
      .from("loan_payments")
      .select("loan_id, amount, paid_on")
      .eq("user_id", userId)
      .gte("paid_on", previousMonthStart)
      .lt("paid_on", nextMonthStart)
      .in("loan_id", loanIds);

    const paidByLoanId = new Map<string, number>();
    (payments ?? []).forEach((payment: { loan_id: string; amount: number }) => {
      paidByLoanId.set(payment.loan_id, (paidByLoanId.get(payment.loan_id) ?? 0) + Number(payment.amount));
    });

    let totalPayable = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let monthlyDue = 0;
    let currentMonthPaid = 0;
    let previousMonthPaid = 0;

    (payments ?? []).forEach((payment: { amount: number; paid_on: string }) => {
      const amount = Number(payment.amount);
      if (payment.paid_on.startsWith(monthKey)) {
        currentMonthPaid += amount;
      } else if (payment.paid_on.startsWith(previousMonthKey)) {
        previousMonthPaid += amount;
      }
    });

    activeLoans.forEach((loan: {
      id: string;
      total_amount: number;
      interest_rate: number;
      monthly_installment: number;
    }) => {
      const principal = Number(loan.total_amount);
      const payable = principal + principal * (Number(loan.interest_rate) / 100);
      const paid = paidByLoanId.get(loan.id) ?? 0;
      const remaining = Math.max(payable - paid, 0);

      totalPayable += payable;
      totalPaid += paid;
      totalRemaining += remaining;
      monthlyDue += Number(loan.monthly_installment);
    });

    result.loanSummary = {
      activeLoans: activeLoans.length,
      totalPayable,
      totalPaid,
      totalRemaining,
      monthlyDue,
      currentMonthPaid,
      previousMonthPaid,
    };
  }

  return result;
}


