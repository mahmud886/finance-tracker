"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema, budgetUpdateSchema } from "@/lib/validations/budget";

export async function createBudget(formData: FormData) {
  const user = await requireUser();
  const parsed = budgetSchema.safeParse({
    category_id: formData.get("category_id"),
    limit_amount: formData.get("limit_amount"),
    month: formData.get("month"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid budget");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
}

export async function updateBudget(formData: FormData) {
  const user = await requireUser();
  const parsed = budgetUpdateSchema.safeParse({
    id: formData.get("id"),
    category_id: formData.get("category_id"),
    limit_amount: formData.get("limit_amount"),
    month: formData.get("month"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid budget");
  }

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase
    .from("budgets")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
}

export async function deleteBudget(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing budget id");

  const supabase = await createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/budgets");
}

