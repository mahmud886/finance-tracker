import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border/90 bg-input/95 px-3 py-2 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/90 hover:border-ring/35 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        className,
      )}
      {...props}
    />
  );
}

