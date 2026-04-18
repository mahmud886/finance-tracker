import { format } from "date-fns";
import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { budgetSchema } from "@/lib/validations/budget";

const budgetListQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).default(format(new Date(), "yyyy-MM")),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { month } = parseQuery(request, budgetListQuerySchema);

    const { data, error } = await supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .eq("month", month)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const budgets = data ?? [];
    const { data: txData } = await supabase
      .from("transactions")
      .select("id, amount, type, date, category_id")
      .eq("user_id", user.id)
      .eq("type", "expense")
      .gte("date", `${month}-01`)
      .lt("date", `${month}-32`);

    const transactions = txData ?? [];

    const budgetsWithSpent = budgets.map((budget) => {
      const spent = transactions
        .filter((tx) => tx.category_id === budget.category_id && tx.date.startsWith(month))
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        ...budget,
        spent,
      };
    });

    return ok(request, budgetsWithSpent);
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const payload = await parseJsonBody(request, budgetSchema);

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        ...payload,
      })
      .select("*, category:categories(*)")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create budget");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

