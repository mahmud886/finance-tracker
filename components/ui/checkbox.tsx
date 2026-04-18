"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return <input type="checkbox" className={cn("h-4 w-4 accent-emerald-600", className)} {...props} />;
}

