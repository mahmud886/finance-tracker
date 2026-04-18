"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, categoryUpdateSchema } from "@/lib/validations/category";

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid category");

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ user_id: user.id, ...parsed.data });
  if (error) throw new Error(error.message);

  revalidatePath("/categories");
  revalidatePath("/transactions");
}

export async function updateCategory(formData: FormData) {
  const user = await requireUser();
  const parsed = categoryUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });

  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid category");

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/transactions");
}

export async function deleteCategory(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing category id");

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/transactions");
}

