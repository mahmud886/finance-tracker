import { z } from "zod";

import { ApiError } from "@/app/api/_helper/errors";
import { requireApiUser } from "@/app/api/_helper/auth";
import { parseJsonBody, parseQuery } from "@/app/api/_helper/request";
import { created, errorResponse, ok } from "@/app/api/_helper/response";
import { loanPaymentSchema } from "@/lib/validations/loan";

const listQuerySchema = z.object({
  loan_id: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireApiUser();
    const query = parseQuery(request, listQuerySchema);

    let paymentsQuery = supabase
      .from("loan_payments")
      .select("*")
      .eq("user_id", user.id)
      .order("paid_on", { ascending: false });

    if (query.loan_id) {
      paymentsQuery = paymentsQuery.eq("loan_id", query.loan_id);
    }

    const { data, error } = await paymentsQuery;

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
    const payload = await parseJsonBody(request, loanPaymentSchema);

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, monthly_installment")
      .eq("id", payload.loan_id)
      .eq("user_id", user.id)
      .single();

    if (loanError || !loan) {
      throw new ApiError(404, "NOT_FOUND", "Loan not found");
    }

    const { data, error } = await supabase
      .from("loan_payments")
      .insert({
        user_id: user.id,
        loan_id: payload.loan_id,
        amount: payload.amount ?? Number(loan.monthly_installment),
        paid_on: payload.paid_on,
        note: payload.note,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create loan payment");
    }

    return created(request, data);
  } catch (error) {
    return errorResponse(request, error);
  }
}

