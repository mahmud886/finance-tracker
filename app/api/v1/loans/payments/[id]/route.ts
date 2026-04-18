import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, noContent, ok } from "@/app/api/_helper/response";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateSchema = z
  .object({
    amount: z.coerce.number().positive().optional(),
    paid_on: z.string().min(1).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) => value.amount !== undefined || value.paid_on !== undefined || value.note !== undefined,
    "Provide at least one field to update",
  );

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase
      .from("loan_payments")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Loan payment not found");
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
    const payload = await parseJsonBody(request, updateSchema);

    const { data, error } = await supabase
      .from("loan_payments")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Loan payment not found");
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

    const { error } = await supabase.from("loan_payments").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

