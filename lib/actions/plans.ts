"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  budgetTemplateSchema,
  budgetTemplateUpdateSchema,
  groceryCatalogItemSchema,
  groceryCatalogItemUpdateSchema,
  templateItemSchema,
  templateItemToggleSchema,
  templateItemUpdateSchema,
} from "@/lib/validations/plan";

function normalizeOptionalUuid(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function toOptionalBoolean(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const normalized = value.toString().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function revalidatePlanPaths() {
  revalidatePath("/plans");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

function normalizeOptionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

export async function createBudgetTemplate(formData: FormData) {
  const user = await requireUser();
  const parsed = budgetTemplateSchema.safeParse({
    name: formData.get("name"),
    month: formData.get("month"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan template");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("budget_templates").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function updateBudgetTemplate(formData: FormData) {
  const user = await requireUser();
  const parsed = budgetTemplateUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    month: formData.get("month"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan template");
  }

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase
    .from("budget_templates")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function deleteBudgetTemplate(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();

  if (!id) throw new Error("Missing plan template id");

  const supabase = await createClient();
  const { error } = await supabase.from("budget_templates").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function createTemplateItem(formData: FormData) {
  const user = await requireUser();
  const parsed = templateItemSchema.safeParse({
    template_id: formData.get("template_id"),
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    estimated_price: formData.get("estimated_price"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan item");
  }

  const supabase = await createClient();
  const { category_id, ...payload } = parsed.data;

  const { error } = await supabase.from("template_items").insert({
    user_id: user.id,
    category_id: normalizeOptionalUuid(category_id),
    ...payload,
  });

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function updateTemplateItem(formData: FormData) {
  const user = await requireUser();
  const parsed = templateItemUpdateSchema.safeParse({
    id: formData.get("id"),
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    estimated_price: formData.get("estimated_price"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan item");
  }

  const supabase = await createClient();
  const { id, category_id, ...payload } = parsed.data;

  const nextPayload = {
    ...payload,
    ...(category_id !== undefined ? { category_id: normalizeOptionalUuid(category_id) } : {}),
  };

  const { error } = await supabase
    .from("template_items")
    .update(nextPayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function deleteTemplateItem(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id")?.toString();

  if (!id) throw new Error("Missing plan item id");

  const supabase = await createClient();
  const { error } = await supabase.from("template_items").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function toggleTemplateItemPurchased(formData: FormData) {
  const user = await requireUser();
  const parsed = templateItemToggleSchema.safeParse({
    id: formData.get("id"),
    checked: toOptionalBoolean(formData.get("checked")),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan item status");
  }

  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from("template_items")
    .select("id, name, user_id, category_id, estimated_price, is_purchased, purchased_transaction_id")
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .single();

  if (itemError || !item) {
    throw new Error(itemError?.message ?? "Plan item not found");
  }

  const shouldCheck = parsed.data.checked ?? !item.is_purchased;

  if (shouldCheck) {
    if (!item.category_id) {
      throw new Error("Assign a category before marking this item as purchased");
    }

    let transactionId = item.purchased_transaction_id;

    if (!transactionId) {
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          amount: Number(item.estimated_price),
          type: "expense",
          category_id: item.category_id,
          note: `Plan purchase: ${item.name}`,
          date: format(new Date(), "yyyy-MM-dd"),
          is_recurring: false,
          recurring_type: "none",
        })
        .select("id")
        .single();

      if (transactionError || !transaction) {
        throw new Error(transactionError?.message ?? "Failed to create expense transaction");
      }

      transactionId = transaction.id;
    }

    const { error } = await supabase
      .from("template_items")
      .update({
        is_purchased: true,
        purchased_at: new Date().toISOString(),
        purchased_transaction_id: transactionId,
      })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  } else {
    if (item.purchased_transaction_id) {
      const { error: deleteTransactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", item.purchased_transaction_id)
        .eq("user_id", user.id);

      if (deleteTransactionError) {
        throw new Error(deleteTransactionError.message);
      }
    }

    const { error } = await supabase
      .from("template_items")
      .update({
        is_purchased: false,
        purchased_at: null,
        purchased_transaction_id: null,
      })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
  }

  revalidatePlanPaths();
}

export async function createGroceryCatalogItem(formData: FormData) {
  await requireUser();
  const parsed = groceryCatalogItemSchema.safeParse({
    group_name_bn: formData.get("group_name_bn"),
    group_name_en: formData.get("group_name_en"),
    item_name_bn: formData.get("item_name_bn"),
    item_name_en: formData.get("item_name_en"),
    default_unit: formData.get("default_unit"),
    sort_order: formData.get("sort_order") ?? 0,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid catalog item");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("grocery_catalog_items").insert({
    ...parsed.data,
    item_name_en: normalizeOptionalText(parsed.data.item_name_en),
  });

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function updateGroceryCatalogItem(formData: FormData) {
  await requireUser();
  const parsed = groceryCatalogItemUpdateSchema.safeParse({
    id: formData.get("id"),
    group_name_bn: formData.get("group_name_bn"),
    group_name_en: formData.get("group_name_en"),
    item_name_bn: formData.get("item_name_bn"),
    item_name_en: formData.get("item_name_en"),
    default_unit: formData.get("default_unit"),
    sort_order: formData.get("sort_order"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid catalog item");
  }

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase
    .from("grocery_catalog_items")
    .update({
      ...payload,
      item_name_en: normalizeOptionalText(payload.item_name_en),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

export async function deleteGroceryCatalogItem(formData: FormData) {
  await requireUser();
  const id = formData.get("id")?.toString();

  if (!id) throw new Error("Missing catalog item id");

  const supabase = await createClient();
  const { error } = await supabase.from("grocery_catalog_items").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePlanPaths();
}

