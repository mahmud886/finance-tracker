import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, noContent, ok } from "@/app/api/_helper/response";
import { toOptionalUuid } from "@/app/api/_utils/normalizers";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateSchema = z
  .object({
    category_id: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    quantity: z.coerce.number().positive().optional(),
    unit: z.string().trim().min(1).max(20).optional(),
    estimated_price: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (value) =>
      value.category_id !== undefined ||
      value.name !== undefined ||
      value.quantity !== undefined ||
      value.unit !== undefined ||
      value.estimated_price !== undefined,
    "Provide at least one field to update",
  );

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase
      .from("template_items")
      .select("*, category:categories(*)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Template item not found");
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

    const nextPayload = {
      ...payload,
      ...(payload.category_id !== undefined ? { category_id: toOptionalUuid(payload.category_id) } : {}),
    };

    const { data, error } = await supabase
      .from("template_items")
      .update(nextPayload)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*, category:categories(*)")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Template item not found");
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

    const { error } = await supabase.from("template_items").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

