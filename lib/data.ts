import { format } from "date-fns";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  Budget,
  BudgetTemplate,
  Category,
  GroceryCatalogItem,
  Loan,
  LoanPayment,
  TemplateItem,
  Transaction,
} from "@/types/app";

export async function getProfile() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase.from("users").select("*").eq("id", user.id).single();

  return (
    data ?? {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata.name ?? "",
      avatar_url: null,
      currency: "USD",
      created_at: new Date().toISOString(),
    }
  );
}

export async function getCategories(): Promise<Category[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function getTransactions(limit = 100): Promise<Transaction[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Transaction[];
}

export async function getBudgets(month = format(new Date(), "yyyy-MM")): Promise<Budget[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budgets")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .eq("month", month)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const budgets = (data ?? []) as Budget[];
  const transactions = await getTransactions(500);

  return budgets.map((budget) => {
    const spent = transactions
      .filter(
        (tx) =>
          tx.type === "expense" &&
          tx.category_id === budget.category_id &&
          tx.date.startsWith(month),
      )
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return { ...budget, spent };
  });
}

export async function getBudgetTemplates(month = format(new Date(), "yyyy-MM")): Promise<BudgetTemplate[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budget_templates")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BudgetTemplate[];
}

export async function getTemplateItems(templateId?: string): Promise<TemplateItem[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const query = supabase
    .from("template_items")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data, error } = templateId ? await query.eq("template_id", templateId) : await query;

  if (error) throw new Error(error.message);
  return (data ?? []) as TemplateItem[];
}

export async function getLoans(): Promise<Loan[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Loan[];
}

export async function getLoanPayments(loanId?: string): Promise<LoanPayment[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const query = supabase
    .from("loan_payments")
    .select("*")
    .eq("user_id", user.id)
    .order("paid_on", { ascending: false });

  const { data, error } = loanId ? await query.eq("loan_id", loanId) : await query;

  if (error) throw new Error(error.message);
  return (data ?? []) as LoanPayment[];
}

export async function getGroceryCatalogItems(): Promise<GroceryCatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grocery_catalog_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("item_name_bn", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as GroceryCatalogItem[];
}

