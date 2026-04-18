"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loanPaymentSchema, loanPaymentUpdateSchema, loanSchema, loanUpdateSchema } from "@/lib/validations/loan";

function normalizeOptionalNumber(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const text = value.toString().trim();
  if (!text) return undefined;
  return text;
}

function revalidateLoanPaths() {
  revalidatePath("/loans");
  revalidatePath("/dashboard");
}

export async function createLoan(formData: FormData) {
  const user = await requireUser();
  const parsed = loanSchema.safeParse({
    name: formData.get("name"),
    total_amount: formData.get("total_amount"),
    interest_rate: formData.get("interest_rate"),
    monthly_installment: formData.get("monthly_installment"),
    start_date: formData.get("start_date"),
    due_day: normalizeOptionalNumber(formData.get("due_day")),
    status: formData.get("status") ?? "active",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid loan fields");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("loans").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) throw new Error(error.message);
  revalidateLoanPaths();
}

export async function updateLoan(formData: FormData) {
  const user = await requireUser();
  const parsed = loanUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    total_amount: normalizeOptionalNumber(formData.get("total_amount")),
    interest_rate: normalizeOptionalNumber(formData.get("interest_rate")),
    monthly_installment: normalizeOptionalNumber(formData.get("monthly_installment")),
    start_date: formData.get("start_date") || undefined,
    due_day: normalizeOptionalNumber(formData.get("due_day")),
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid loan fields");
  }

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase.from("loans").update(payload).eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateLoanPaths();
}

export async function deleteLoan(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();

  if (!id) throw new Error("Missing loan id");

  const supabase = await createClient();
  const { error } = await supabase.from("loans").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateLoanPaths();
}

export async function createLoanPayment(formData: FormData) {
  const user = await requireUser();
  const parsed = loanPaymentSchema.safeParse({
    loan_id: formData.get("loan_id"),
    amount: normalizeOptionalNumber(formData.get("amount")),
    paid_on: formData.get("paid_on") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid loan payment fields");
  }

  const supabase = await createClient();
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("id, monthly_installment")
    .eq("id", parsed.data.loan_id)
    .eq("user_id", user.id)
    .single();

  if (loanError || !loan) {
    throw new Error(loanError?.message ?? "Loan not found");
  }

  const amount = parsed.data.amount ?? Number(loan.monthly_installment);
  const { error } = await supabase.from("loan_payments").insert({
    user_id: user.id,
    loan_id: parsed.data.loan_id,
    amount,
    paid_on: parsed.data.paid_on,
    note: parsed.data.note,
  });

  if (error) throw new Error(error.message);
  revalidateLoanPaths();
}

export async function markLoanEmiPaid(formData: FormData) {
  return createLoanPayment(formData);
}

export async function updateLoanPayment(formData: FormData) {
  const user = await requireUser();
  const parsed = loanPaymentUpdateSchema.safeParse({
    id: formData.get("id"),
    amount: normalizeOptionalNumber(formData.get("amount")),
    paid_on: formData.get("paid_on") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid loan payment fields");
  }

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase
    .from("loan_payments")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateLoanPaths();
}

export async function deleteLoanPayment(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();

  if (!id) throw new Error("Missing loan payment id");

  const supabase = await createClient();
  const { error } = await supabase.from("loan_payments").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateLoanPaths();
}

