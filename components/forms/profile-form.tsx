"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateProfile } from "@/lib/actions/profile";
import { CURRENCIES } from "@/lib/constants";
import { profileSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const formSchema = profileSchema;
type FormValues = z.infer<typeof formSchema>;

export function ProfileForm({
  profile,
}: {
  profile: { name: string | null; avatar_url: string | null; currency: string };
}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile.name ?? "",
      avatar_url: profile.avatar_url ?? "",
      currency: (profile.currency as (typeof CURRENCIES)[number]) ?? "USD",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("currency", values.currency);
      formData.set("avatar_url", values.avatar_url ?? "");

      try {
        await updateProfile(formData);
        toast.success("Profile updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    });
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" {...register("avatar_url")} />
        {errors.avatar_url ? <p className="text-xs text-red-500">{errors.avatar_url.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select id="currency" {...register("currency")}>
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}

