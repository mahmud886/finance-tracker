import { z } from "zod";

export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  limit_amount: z.coerce.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export const budgetUpdateSchema = budgetSchema.extend({
  id: z.string().uuid(),
});

