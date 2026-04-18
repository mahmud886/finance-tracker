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
    name: z.string().trim().min(2).max(100).optional(),
    total_amount: z.coerce.number().positive().optional(),
    interest_rate: z.coerce.number().nonnegative().optional(),
    monthly_installment: z.coerce.number().positive().optional(),
    start_date: z.string().min(1).optional(),
    due_day: z.coerce.number().int().min(1).max(31).optional(),
    status: z.enum(["active", "closed", "defaulted"]).optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.total_amount !== undefined ||
      value.interest_rate !== undefined ||
      value.monthly_installment !== undefined ||
      value.start_date !== undefined ||
      value.due_day !== undefined ||
      value.status !== undefined,
    "Provide at least one field to update",
  );

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase.from("loans").select("*").eq("id", params.id).eq("user_id", user.id).single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Loan not found");
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
      .from("loans")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Loan not found");
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

    const { error } = await supabase.from("loans").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

