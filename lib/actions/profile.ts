"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/auth";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile data");
  }

  const supabase = await createClient();

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email ?? "",
    ...parsed.data,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

