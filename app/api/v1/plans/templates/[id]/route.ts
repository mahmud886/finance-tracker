import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, noContent, ok } from "@/app/api/_helper/response";
import { budgetTemplateSchema } from "@/lib/validations/plan";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateSchema = budgetTemplateSchema.partial().refine(
  (value) => value.name !== undefined || value.month !== undefined,
  "Provide at least one field to update",
);

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase
      .from("budget_templates")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Template not found");
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
      .from("budget_templates")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Template not found");
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

    const { error } = await supabase.from("budget_templates").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

