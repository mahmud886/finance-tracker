"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";

import { createBudget, updateBudget } from "@/lib/actions/budgets";
import { budgetSchema } from "@/lib/validations/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Budget, Category } from "@/types/app";

const formSchema = budgetSchema;
type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function BudgetForm({ categories, budget }: { categories: Category[]; budget?: Budget }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: budget?.category_id ?? categories[0]?.id,
      limit_amount: budget?.limit_amount ?? 0,
      month: budget?.month ?? format(new Date(), "yyyy-MM"),
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (budget) formData.set("id", budget.id);
      formData.set("category_id", values.category_id);
      formData.set("limit_amount", String(values.limit_amount));
      formData.set("month", values.month);

      try {
        if (budget) {
          await updateBudget(formData);
          toast.success("Budget updated");
        } else {
          await createBudget(formData);
          toast.success("Budget created");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save budget");
      }
    });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="category_id">Category</Label>
        <Select id="category_id" {...register("category_id")}>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="limit_amount">Monthly limit</Label>
        <Input id="limit_amount" type="number" step="0.01" {...register("limit_amount", { valueAsNumber: true })} />
        {errors.limit_amount ? <p className="text-xs text-red-500">{errors.limit_amount.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="month">Month (YYYY-MM)</Label>
        <Input id="month" {...register("month")} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
      </Button>
    </form>
  );
}
