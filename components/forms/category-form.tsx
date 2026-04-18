"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createCategory, updateCategory } from "@/lib/actions/categories";
import { categorySchema } from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/types/app";

const formSchema = categorySchema;
type FormValues = z.infer<typeof formSchema>;

export function CategoryForm({ category }: { category?: Category }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? "tag",
      color: category?.color ?? "#3b82f6",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (category) formData.set("id", category.id);
      formData.set("name", values.name);
      formData.set("icon", values.icon);
      formData.set("color", values.color);

      try {
        if (category) {
          await updateCategory(formData);
          toast.success("Category updated");
        } else {
          await createCategory(formData);
          toast.success("Category created");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save category");
      }
    });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" {...register("icon")} />
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <Input id="color" type="color" {...register("color")} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : category ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}

