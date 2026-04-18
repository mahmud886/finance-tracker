import { z } from "zod";

const loanStatusSchema = z.enum(["active", "closed", "defaulted"]);

export const loanSchema = z.object({
  name: z.string().trim().min(2).max(100),
  total_amount: z.coerce.number().positive(),
  interest_rate: z.coerce.number().nonnegative(),
  monthly_installment: z.coerce.number().positive(),
  start_date: z.string().min(1),
  due_day: z.coerce.number().int().min(1).max(31).optional(),
  status: loanStatusSchema.default("active"),
});

export const loanUpdateSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(100).optional(),
    total_amount: z.coerce.number().positive().optional(),
    interest_rate: z.coerce.number().nonnegative().optional(),
    monthly_installment: z.coerce.number().positive().optional(),
    start_date: z.string().min(1).optional(),
    due_day: z.coerce.number().int().min(1).max(31).optional(),
    status: loanStatusSchema.optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.total_amount !== undefined ||
      value.interest_rate !== undefined ||
      value.monthly_installment !== undefined ||
      value.start_date !== undefined ||
      value.due_day !== undefined ||
      value.status !== undefined,
    "Provide at least one field to update",
  );

export const loanPaymentSchema = z.object({
  loan_id: z.string().uuid(),
  amount: z.coerce.number().positive().optional(),
  paid_on: z.string().min(1).optional(),
  note: z.string().trim().max(500).optional(),
});

export const loanPaymentUpdateSchema = z
  .object({
    id: z.string().uuid(),
    amount: z.coerce.number().positive().optional(),
    paid_on: z.string().min(1).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) => value.amount !== undefined || value.paid_on !== undefined || value.note !== undefined,
    "Provide at least one field to update",
  );

