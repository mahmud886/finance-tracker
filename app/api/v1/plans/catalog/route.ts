import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { toOptionalText } from "@/app/api/_utils/normalizers";
import { groceryCatalogItemSchema } from "@/lib/validations/plan";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireApiUser();

    const { data, error } = await supabase
      .from("grocery_catalog_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("item_name_bn", { ascending: true });

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
    const { supabase } = await requireApiUser();
    const payload = await parseJsonBody(request, groceryCatalogItemSchema);

    const { data, error } = await supabase
      .from("grocery_catalog_items")
      .insert({
        ...payload,
        item_name_en: toOptionalText(payload.item_name_en),
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create catalog item");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

