import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, noContent, ok } from "@/app/api/_helper/response";
import { transactionSchema } from "@/lib/validations/transaction";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateTransactionSchema = transactionSchema.partial().refine(
  (value) =>
    value.amount !== undefined ||
    value.type !== undefined ||
    value.category_id !== undefined ||
    value.note !== undefined ||
    value.date !== undefined ||
    value.is_recurring !== undefined ||
    value.recurring_type !== undefined ||
    value.tags !== undefined,
  "Provide at least one field to update",
);

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Transaction not found");
    }

    return ok(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);
    const { tags, ...payload } = await parseJsonBody(request, updateTransactionSchema);
    void tags;

    const { data, error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*, category:categories(*)")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Transaction not found");
    }

    return ok(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { error } = await supabase.from("transactions").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

