import { z } from "zod";

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export const budgetTemplateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  month: z.string().regex(monthPattern, "Month must be in YYYY-MM format"),
});

export const budgetTemplateUpdateSchema = budgetTemplateSchema.extend({
  id: z.string().uuid(),
});

export const templateItemSchema = z.object({
  template_id: z.string().uuid(),
  category_id: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().positive(),
  unit: z.string().trim().min(1).max(20),
  estimated_price: z.coerce.number().nonnegative(),
});

export const templateItemUpdateSchema = z
  .object({
    id: z.string().uuid(),
    category_id: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    quantity: z.coerce.number().positive().optional(),
    unit: z.string().trim().min(1).max(20).optional(),
    estimated_price: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (value) =>
      value.category_id !== undefined ||
      value.name !== undefined ||
      value.quantity !== undefined ||
      value.unit !== undefined ||
      value.estimated_price !== undefined,
    "Provide at least one field to update",
  );

export const templateItemToggleSchema = z.object({
  id: z.string().uuid(),
  checked: z.boolean().optional(),
});

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const text = value.trim();
    return text.length > 0 ? text : undefined;
  },
  z.string().min(1).max(120).optional(),
);

export const groceryCatalogItemSchema = z.object({
  group_name_bn: z.string().trim().min(2).max(80),
  group_name_en: z.string().trim().min(2).max(80),
  item_name_bn: z.string().trim().min(1).max(120),
  item_name_en: optionalTrimmedString,
  default_unit: z.string().trim().min(1).max(20),
  sort_order: z.coerce.number().int().nonnegative().default(0),
});

export const groceryCatalogItemUpdateSchema = groceryCatalogItemSchema.extend({
  id: z.string().uuid(),
}).refine(
  (value) =>
    value.group_name_bn !== undefined ||
    value.group_name_en !== undefined ||
    value.item_name_bn !== undefined ||
    value.item_name_en !== undefined ||
    value.default_unit !== undefined ||
    value.sort_order !== undefined,
  "Provide at least one field to update",
);

