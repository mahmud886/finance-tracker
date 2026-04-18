"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

type Props = {
  totalPlanned: number;
  totalSpent: number;
  completion: number;
  currency: string;
  progressByCategory: Array<{ name: string; completion: number; completed: number; total: number }>;
};

export function PlanSummaryPanels({ totalPlanned, totalSpent, completion, currency, progressByCategory }: Props) {
  return (
    <div className="space-y-4 xl:col-span-2">
      <Card>
        <CardTitle>Plan Summary</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Planned</p>
            <p className="text-lg font-semibold">{formatCurrency(totalPlanned, currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-lg font-semibold">{formatCurrency(totalSpent, currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="text-lg font-semibold">{completion.toFixed(0)}%</p>
          </div>
        </div>
        <Progress value={completion} className="mt-3" />
      </Card>

      <Card>
        <CardTitle>Category-wise Progress</CardTitle>
        <div className="mt-4 space-y-3">
          {progressByCategory.map((group) => (
            <div key={group.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{group.name}</span>
                <span className="text-muted-foreground">
                  {group.completed}/{group.total}
                </span>
              </div>
              <Progress value={group.completion} />
            </div>
          ))}
          {progressByCategory.length === 0 ? <p className="text-sm text-muted-foreground">No items yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}


