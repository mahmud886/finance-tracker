import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(40),
  icon: z.string().min(1).max(30),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
});

export const categoryUpdateSchema = categorySchema.extend({
  id: z.string().uuid(),
});

