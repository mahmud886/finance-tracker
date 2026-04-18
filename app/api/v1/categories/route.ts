import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { categorySchema } from "@/lib/validations/category";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { limit, offset } = parseQuery(request, listQuerySchema);

    const { data, error } = await supabase
      .from("categories")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

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
    const payload = await parseJsonBody(request, categorySchema);

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        ...payload,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create category");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

