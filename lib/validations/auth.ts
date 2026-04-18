import { z } from "zod";

import { CURRENCIES } from "@/lib/constants";

export const signInSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2).max(80).trim(),
});

export const forgotPasswordSchema = z.object({
  email: z.email().trim(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  currency: z.enum(CURRENCIES),
  avatar_url: z.url().optional().or(z.literal("")),
});

