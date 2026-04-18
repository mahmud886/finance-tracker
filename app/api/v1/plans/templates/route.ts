import { format } from "date-fns";
import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { budgetTemplateSchema } from "@/lib/validations/plan";

const listQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).default(format(new Date(), "yyyy-MM")),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const { month } = parseQuery(request, listQuerySchema);

    const { data, error } = await supabase
      .from("budget_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .order("created_at", { ascending: false });

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
    const payload = await parseJsonBody(request, budgetTemplateSchema);

    const { data, error } = await supabase
      .from("budget_templates")
      .insert({
        user_id: user.id,
        ...payload,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create template");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

