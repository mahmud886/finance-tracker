import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, noContent, ok } from "@/app/api/_helper/response";
import { budgetSchema } from "@/lib/validations/budget";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateBudgetSchema = budgetSchema.partial().refine(
  (value) => value.category_id !== undefined || value.limit_amount !== undefined || value.month !== undefined,
  "Provide at least one field to update",
);

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase
      .from("budgets")
      .select("*, category:categories(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Budget not found");
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
    const payload = await parseJsonBody(request, updateBudgetSchema);

    const { data, error } = await supabase
      .from("budgets")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*, category:categories(*)")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Budget not found");
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

    const { error } = await supabase.from("budgets").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

