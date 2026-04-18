import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { toOptionalUuid } from "@/app/api/_utils/normalizers";
import { templateItemSchema } from "@/lib/validations/plan";

const listQuerySchema = z.object({
  template_id: z.string().uuid().optional(),
  purchased: z.enum(["true", "false"]).optional(),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const query = parseQuery(request, listQuerySchema);

    let itemsQuery = supabase
      .from("template_items")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (query.template_id) {
      itemsQuery = itemsQuery.eq("template_id", query.template_id);
    }
    if (query.purchased) {
      itemsQuery = itemsQuery.eq("is_purchased", query.purchased === "true");
    }

    const { data, error } = await itemsQuery;

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
    const payload = await parseJsonBody(request, templateItemSchema);

    const { category_id, ...rest } = payload;
    const { data, error } = await supabase
      .from("template_items")
      .insert({
        user_id: user.id,
        ...rest,
        category_id: toOptionalUuid(category_id),
      })
      .select("*, category:categories(*)")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create template item");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

