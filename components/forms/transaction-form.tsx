"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import { RECURRING_TYPES } from "@/lib/constants";
import { transactionSchema } from "@/lib/validations/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Transaction } from "@/types/app";

const formSchema = transactionSchema.extend({
  date: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function TransactionForm({
  categories,
  transaction,
}: {
  categories: Category[];
  transaction?: Transaction;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: transaction?.amount ?? 0,
      type: transaction?.type ?? "expense",
      category_id: transaction?.category_id ?? categories[0]?.id,
      note: transaction?.note ?? "",
      date: transaction?.date ?? new Date().toISOString().slice(0, 10),
      is_recurring: transaction?.is_recurring ?? false,
      recurring_type: transaction?.recurring_type ?? "none",
      tags: transaction?.tags ?? [],
    },
  });

  const isRecurring = useWatch({ control, name: "is_recurring" });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (transaction) formData.set("id", transaction.id);
      formData.set("amount", String(values.amount));
      formData.set("type", values.type);
      formData.set("category_id", values.category_id);
      formData.set("note", values.note ?? "");
      formData.set("date", values.date);
      if (values.is_recurring) formData.set("is_recurring", "on");
      formData.set("recurring_type", values.recurring_type ?? "none");
      formData.set("tags", (values.tags ?? []).join(","));

      try {
        if (transaction) {
          await updateTransaction(formData);
          toast.success("Transaction updated");
        } else {
          await createTransaction(formData);
          toast.success("Transaction added");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save transaction");
      }
    });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
        {errors.amount ? <p className="text-xs text-red-500">{errors.amount.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select id="type" {...register("type")}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="category_id">Category</Label>
        <Select id="category_id" {...register("category_id")}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" {...register("note")} />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          defaultValue={(transaction?.tags ?? []).join(",")}
          onChange={(event) =>
            setValue(
              "tags",
              event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_recurring")} /> Recurring transaction
      </label>

      {isRecurring ? (
        <div>
          <Label htmlFor="recurring_type">Recurring Type</Label>
          <Select id="recurring_type" {...register("recurring_type")}>
            {RECURRING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : transaction ? "Update Transaction" : "Add Transaction"}
      </Button>
    </form>
  );
}
