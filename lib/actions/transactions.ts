"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema, transactionUpdateSchema } from "@/lib/validations/transaction";

function parseTags(raw: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createTransaction(formData: FormData) {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse({
    amount: formData.get("amount"),
    type: formData.get("type"),
    category_id: formData.get("category_id"),
    note: formData.get("note"),
    date: formData.get("date"),
    is_recurring: formData.get("is_recurring") === "on",
    recurring_type: formData.get("recurring_type") ?? "none",
    tags: parseTags(formData.get("tags")?.toString() ?? null),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transaction fields");
  }

  const supabase = await createClient();
  const { tags, ...payload } = parsed.data;
  void tags;
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    ...payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function updateTransaction(formData: FormData) {
  const user = await requireUser();
  const parsed = transactionUpdateSchema.safeParse({
    id: formData.get("id"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    category_id: formData.get("category_id"),
    note: formData.get("note"),
    date: formData.get("date"),
    is_recurring: formData.get("is_recurring") === "on",
    recurring_type: formData.get("recurring_type") ?? "none",
    tags: parseTags(formData.get("tags")?.toString() ?? null),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid transaction fields");
  }

  const supabase = await createClient();
  const { id, tags, ...payload } = parsed.data;
  void tags;

  const { error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function deleteTransaction(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("Missing transaction id");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}
