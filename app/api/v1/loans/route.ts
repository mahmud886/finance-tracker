import { z } from "zod";

import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { loanSchema } from "@/lib/validations/loan";

const listQuerySchema = z.object({
  status: z.enum(["active", "closed", "defaulted"]).optional(),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const query = parseQuery(request, listQuerySchema);

    let loansQuery = supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (query.status) {
      loansQuery = loansQuery.eq("status", query.status);
    }

    const { data, error } = await loansQuery;

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
    const payload = await parseJsonBody(request, loanSchema);

    const { data, error } = await supabase
      .from("loans")
      .insert({
        user_id: user.id,
        ...payload,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create loan");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

