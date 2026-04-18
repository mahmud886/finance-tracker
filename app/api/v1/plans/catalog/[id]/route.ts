import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { errorResponse, noContent, ok } from "@/app/api/_helper/response";
import { toOptionalText } from "@/app/api/_utils/normalizers";

const routeParamsSchema = z.object({
  id: z.string().uuid(),
});

const updateSchema = z
  .object({
    group_name_bn: z.string().trim().min(2).max(80).optional(),
    group_name_en: z.string().trim().min(2).max(80).optional(),
    item_name_bn: z.string().trim().min(1).max(120).optional(),
    item_name_en: z.string().trim().min(1).max(120).optional(),
    default_unit: z.string().trim().min(1).max(20).optional(),
    sort_order: z.coerce.number().int().nonnegative().optional(),
  })
  .refine(
    (value) =>
      value.group_name_bn !== undefined ||
      value.group_name_en !== undefined ||
      value.item_name_bn !== undefined ||
      value.item_name_en !== undefined ||
      value.default_unit !== undefined ||
      value.sort_order !== undefined,
    "Provide at least one field to update",
  );

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { data, error } = await supabase.from("grocery_catalog_items").select("*").eq("id", params.id).single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Catalog item not found");
    }

    return ok(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);
    const payload = await parseJsonBody(request, updateSchema);

    const { data, error } = await supabase
      .from("grocery_catalog_items")
      .update({
        ...payload,
        item_name_en: payload.item_name_en === undefined ? undefined : toOptionalText(payload.item_name_en),
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new ApiError(404, "NOT_FOUND", "Catalog item not found");
    }

    return ok(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await requireApiUser();
    const params = routeParamsSchema.parse(await context.params);

    const { error } = await supabase.from("grocery_catalog_items").delete().eq("id", params.id);
    if (error) {
      throw new Error(error.message);
    }

    return noContent();
  } catch (error) {
    return errorResponse(request, error);
  }
}

