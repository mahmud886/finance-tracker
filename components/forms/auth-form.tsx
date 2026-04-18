"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { success: false };

type AuthFormProps = {
  title: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Array<{ name: string; label: string; type: string; placeholder?: string }>;
  footer?: React.ReactNode;
  submitLabel: string;
};

export function AuthForm({ title, action, fields, footer, submitLabel }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold">{title}</h1>
      <form action={formAction} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required
            />
          </div>
        ))}

        {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
        {state.success && state.message ? <p className="text-sm text-emerald-600">{state.message}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Please wait..." : submitLabel}
        </Button>
      </form>
      {footer ? <div className="mt-4 text-sm text-muted-foreground">{footer}</div> : null}
      <p className="mt-4 text-xs text-muted-foreground">
        By continuing, you agree to secure data processing and account recovery policies.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Need help? <Link href="/forgot-password" className="underline">Reset password</Link>
      </p>
    </div>
  );
}

