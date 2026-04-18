import { format } from "date-fns";
import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, ok } from "@/app/api/_helper/response";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const payloadSchema = z.object({
  checked: z.boolean().optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);
    const payload = await parseJsonBody(request, payloadSchema);

    const { data: item, error: itemError } = await supabase
      .from("template_items")
      .select("id, name, user_id, category_id, estimated_price, is_purchased, purchased_transaction_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (itemError || !item) {
      throw new ApiError(404, "NOT_FOUND", "Plan item not found");
    }

    const shouldCheck = payload.checked ?? !item.is_purchased;

    if (shouldCheck) {
      if (!item.category_id) {
        throw new ApiError(422, "CATEGORY_REQUIRED", "Assign a category before marking item as purchased");
      }

      let transactionId = item.purchased_transaction_id;

      if (!transactionId) {
        const { data: transaction, error: transactionError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            amount: Number(item.estimated_price),
            type: "expense",
            category_id: item.category_id,
            note: `Plan purchase: ${item.name}`,
            date: format(new Date(), "yyyy-MM-dd"),
            is_recurring: false,
            recurring_type: "none",
          })
          .select("id")
          .single();

        if (transactionError || !transaction) {
          throw new Error(transactionError?.message ?? "Failed to create expense transaction");
        }

        transactionId = transaction.id;
      }

      const { error } = await supabase
        .from("template_items")
        .update({
          is_purchased: true,
          purchased_at: new Date().toISOString(),
          purchased_transaction_id: transactionId,
        })
        .eq("id", item.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      return ok(request, {
        id: item.id,
        is_purchased: true,
        purchased_transaction_id: transactionId,
      });
    }

    if (item.purchased_transaction_id) {
      const { error: deleteTxError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", item.purchased_transaction_id)
        .eq("user_id", user.id);

      if (deleteTxError) {
        throw new Error(deleteTxError.message);
      }
    }

    const { error } = await supabase
      .from("template_items")
      .update({
        is_purchased: false,
        purchased_at: null,
        purchased_transaction_id: null,
      })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return ok(request, {
      id: item.id,
      is_purchased: false,
      purchased_transaction_id: null,
    });
  } catch (error) {
    return errorResponse(request, error);
  }
}

