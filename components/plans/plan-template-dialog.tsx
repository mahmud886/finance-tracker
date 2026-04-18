"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "update";
  isPending: boolean;
  templateName: string;
  templateMonth: string;
  onTemplateNameChange: (value: string) => void;
  onTemplateMonthChange: (value: string) => void;
  onSubmit: () => void;
};

export function PlanTemplateDialog({
  open,
  onOpenChange,
  mode,
  isPending,
  templateName,
  templateMonth,
  onTemplateNameChange,
  onTemplateMonthChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{mode === "update" ? "Update Monthly Plan" : "Create Monthly Plan"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div>
          <Label htmlFor="plan-name">Plan name</Label>
          <Input id="plan-name" value={templateName} onChange={(event) => onTemplateNameChange(event.target.value)} />
        </div>
        <div>
          <Label htmlFor="plan-month">Month (YYYY-MM)</Label>
          <Input id="plan-month" value={templateMonth} onChange={(event) => onTemplateMonthChange(event.target.value)} />
        </div>
        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? "Saving..." : mode === "update" ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </Dialog>
  );
}

