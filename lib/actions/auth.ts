"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { type ActionState } from "@/lib/actions/types";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

async function exchangeBackendToken(supabaseAccessToken: string) {
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required to exchange backend auth token");
  }

  const response = await fetch(`${baseApiUrl}/auth/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken: supabaseAccessToken }),
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { token?: string };
    error?: { message?: string };
  };

  if (!response.ok || !payload?.success || !payload.data?.token) {
    throw new Error(payload?.error?.message ?? "Failed to create backend access token");
  }

  const cookieStore = await cookies();
  cookieStore.set("ft_api_token", payload.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function signInAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid form fields" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  const supabaseAccessToken = data.session?.access_token;
  if (!supabaseAccessToken) {
    return { success: false, error: "Supabase session missing access token" };
  }

  try {
    await exchangeBackendToken(supabaseAccessToken);
  } catch (exchangeError) {
    const message = exchangeError instanceof Error ? exchangeError.message : "Backend token exchange failed";
    return { success: false, error: message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function signUpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid form fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Account created. Check your inbox to verify your email." };
}

export async function forgotPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Reset link sent to your email." };
}

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Password updated. You can now sign in." };
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("ft_api_token");

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

