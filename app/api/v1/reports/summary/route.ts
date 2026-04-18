import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseQuery } from "@/app/api/_helper/request";
import { errorResponse, ok } from "@/app/api/_helper/response";

const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "all"]).default("all"),
  limit: z.coerce.number().int().min(1).max(500).default(250),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const query = parseQuery(request, reportQuerySchema);

    let txQuery = supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(query.limit);

    if (query.startDate) {
      txQuery = txQuery.gte("date", query.startDate);
    }
    if (query.endDate) {
      txQuery = txQuery.lte("date", query.endDate);
    }
    if (query.categoryId) {
      txQuery = txQuery.eq("category_id", query.categoryId);
    }
    if (query.type !== "all") {
      txQuery = txQuery.eq("type", query.type);
    }

    const { data, error } = await txQuery;

    if (error) {
      throw new Error(error.message);
    }

    const transactions = data ?? [];
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return ok(request, {
      transactions,
      summary: {
        income,
        expense,
        balance: income - expense,
        count: transactions.length,
      },
    });
  } catch (error) {
    return errorResponse(request, error);
  }
}

