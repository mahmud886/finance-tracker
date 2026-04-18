import { z } from "zod";

import { RECURRING_TYPES } from "@/lib/constants";

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid(),
  note: z.string().max(500).optional(),
  date: z.string().min(1),
  is_recurring: z.boolean().default(false),
  recurring_type: z.enum(RECURRING_TYPES).default("none"),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const transactionUpdateSchema = transactionSchema.extend({
  id: z.string().uuid(),
});

