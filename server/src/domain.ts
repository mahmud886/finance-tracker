import { z } from 'zod';

export const currencies = ['USD', 'BDT', 'EUR', 'GBP', 'INR'] as const;
export const transactionTypes = ['income', 'expense'] as const;
export const recurringTypes = ['none', 'daily', 'weekly', 'monthly'] as const;
export const loanStatuses = ['active', 'closed', 'defaulted'] as const;

export const currencySchema = z.enum(currencies);
export const transactionTypeSchema = z.enum(transactionTypes);
export const recurringTypeSchema = z.enum(recurringTypes);
export const loanStatusSchema = z.enum(loanStatuses);

export const emailSchema = z.string().trim().email();
export const uuidSchema = z.string().uuid();
export const colorSchema = z
  .string()
  .trim()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
export const monthSchema = z.string().trim().regex(/^\d{4}-\d{2}$/);
export const dateSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/);

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  currency: (typeof currencies)[number];
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
  resetTokenHash: string | null;
  resetTokenExpiresAt: string | null;
}

export interface CategoryRecord {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  amount: number;
  type: (typeof transactionTypes)[number];
  categoryId: string;
  note: string | null;
  date: string;
  isRecurring: boolean;
  recurringType: (typeof recurringTypes)[number];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRecord {
  id: string;
  userId: string;
  categoryId: string;
  limitAmount: number;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanTemplateRecord {
  id: string;
  userId: string;
  name: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanItemRecord {
  id: string;
  userId: string;
  templateId: string;
  categoryId: string | null;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  isPurchased: boolean;
  purchasedAt: string | null;
  purchasedTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogItemRecord {
  id: string;
  groupNameBn: string;
  groupNameEn: string;
  itemNameBn: string;
  itemNameEn: string | null;
  defaultUnit: string;
  sortOrder: number;
  createdAt: string;
}

export interface LoanRecord {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  interestRate: number;
  monthlyInstallment: number;
  startDate: string;
  dueDay: number | null;
  status: (typeof loanStatuses)[number];
  createdAt: string;
  updatedAt: string;
}

export interface LoanPaymentRecord {
  id: string;
  userId: string;
  loanId: string;
  amount: number;
  paidOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(8).max(128),
  name: z.string().trim().min(2).max(80),
  currency: currencySchema.default('USD'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(8).max(128),
});

export const supabaseExchangeSchema = z.object({
  accessToken: z.string().trim().min(20),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10),
  password: z.string().trim().min(8).max(128),
  confirmPassword: z.string().trim().min(8).max(128),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatarUrl: z.string().trim().url().optional().nullable(),
  currency: currencySchema.optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(40),
  icon: z.string().trim().min(1).max(40),
  color: colorSchema,
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryListSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const transactionCreateSchema = z.object({
  amount: z.coerce.number().positive(),
  type: transactionTypeSchema,
  categoryId: uuidSchema,
  note: z.string().trim().max(500).optional().nullable(),
  date: dateSchema,
  isRecurring: z.coerce.boolean().default(false),
  recurringType: recurringTypeSchema.default('none'),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

export const transactionListSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  type: transactionTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
});

export const budgetCreateSchema = z.object({
  categoryId: uuidSchema,
  limitAmount: z.coerce.number().positive(),
  month: monthSchema,
});

export const budgetUpdateSchema = budgetCreateSchema.partial();

export const budgetListSchema = z.object({
  month: monthSchema.optional(),
});

export const templateCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  month: monthSchema,
});

export const templateUpdateSchema = templateCreateSchema.partial();

export const templateListSchema = z.object({
  month: monthSchema.optional(),
});

export const planItemCreateSchema = z.object({
  templateId: uuidSchema,
  categoryId: uuidSchema.optional().nullable(),
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().trim().min(1).max(20),
  estimatedPrice: z.coerce.number().nonnegative(),
});

export const planItemUpdateSchema = planItemCreateSchema.partial();

export const planItemListSchema = z.object({
  templateId: uuidSchema.optional(),
  purchased: z.enum(['true', 'false']).optional(),
});

export const togglePurchasedSchema = z.object({
  checked: z.coerce.boolean().optional(),
});

export const catalogCreateSchema = z.object({
  groupNameBn: z.string().trim().min(1).max(120),
  groupNameEn: z.string().trim().min(1).max(120),
  itemNameBn: z.string().trim().min(1).max(120),
  itemNameEn: z.string().trim().min(1).max(120).optional().nullable(),
  defaultUnit: z.string().trim().min(1).max(20),
  sortOrder: z.coerce.number().int().default(0),
});

export const catalogUpdateSchema = catalogCreateSchema.partial();

export const catalogListSchema = z.object({
  groupNameBn: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const loanCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  totalAmount: z.coerce.number().positive(),
  interestRate: z.coerce.number().nonnegative(),
  monthlyInstallment: z.coerce.number().positive(),
  startDate: dateSchema,
  dueDay: z.coerce.number().int().min(1).max(31).optional().nullable(),
  status: loanStatusSchema.default('active'),
});

export const loanUpdateSchema = loanCreateSchema.partial();

export const loanListSchema = z.object({
  status: loanStatusSchema.optional(),
});

export const loanPaymentCreateSchema = z.object({
  loanId: uuidSchema,
  amount: z.coerce.number().positive(),
  paidOn: dateSchema,
  note: z.string().trim().max(500).optional().nullable(),
});

export const loanPaymentUpdateSchema = loanPaymentCreateSchema.partial();

export const loanPaymentListSchema = z.object({
  loanId: uuidSchema.optional(),
});

export const reportSummarySchema = z.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  categoryId: uuidSchema.optional(),
  type: z.enum(['income', 'expense', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(500).default(250),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SupabaseExchangeInput = z.infer<typeof supabaseExchangeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>;
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>;
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>;
export type PlanItemCreateInput = z.infer<typeof planItemCreateSchema>;
export type PlanItemUpdateInput = z.infer<typeof planItemUpdateSchema>;
export type TogglePurchasedInput = z.infer<typeof togglePurchasedSchema>;
export type CatalogCreateInput = z.infer<typeof catalogCreateSchema>;
export type CatalogUpdateInput = z.infer<typeof catalogUpdateSchema>;
export type LoanCreateInput = z.infer<typeof loanCreateSchema>;
export type LoanUpdateInput = z.infer<typeof loanUpdateSchema>;
export type LoanPaymentCreateInput = z.infer<typeof loanPaymentCreateSchema>;
export type LoanPaymentUpdateInput = z.infer<typeof loanPaymentUpdateSchema>;

