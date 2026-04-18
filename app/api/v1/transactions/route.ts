import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { transactionSchema } from "@/lib/validations/transaction";

const transactionListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  type: z.enum(["income", "expense"]).optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const query = parseQuery(request, transactionListQuerySchema);

    let txQuery = supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.type) {
      txQuery = txQuery.eq("type", query.type);
    }
    if (query.category_id) {
      txQuery = txQuery.eq("category_id", query.category_id);
    }
    if (query.start_date) {
      txQuery = txQuery.gte("date", query.start_date);
    }
    if (query.end_date) {
      txQuery = txQuery.lte("date", query.end_date);
    }

    const { data, error } = await txQuery;

    if (error) {
      throw new Error(error.message);
    }

    return ok(request, data ?? []);
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { tags, ...payload } = await parseJsonBody(request, transactionSchema);
    void tags;

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        ...payload,
      })
      .select("*, category:categories(*)")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create transaction");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

