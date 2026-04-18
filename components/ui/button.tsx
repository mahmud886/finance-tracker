import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-medium tracking-[0.01em] transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white shadow-sm shadow-emerald-900/25 hover:-translate-y-px hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-900/35",
        outline: "border border-border bg-card/85 text-foreground shadow-sm hover:-translate-y-px hover:bg-muted/80 hover:shadow-md",
        ghost: "text-foreground hover:bg-muted/80",
        danger: "bg-red-600 text-white shadow-sm shadow-red-900/20 hover:-translate-y-px hover:bg-red-500 hover:shadow-md hover:shadow-red-900/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

