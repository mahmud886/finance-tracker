import { type ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function PageHero({
  eyebrow,
  title,
  description,
  badges,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-border/80 bg-linear-to-br from-card via-card to-muted/35 shadow-(--shadow-md)">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-6">
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
          </div>
          {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </Card>
  );
}

