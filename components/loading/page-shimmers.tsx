import { Card } from "@/components/ui/card";

function Shimmer({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/80 ${className}`} />;
}

export function PageHeroShimmer({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="overflow-hidden border-border/80 bg-linear-to-br from-card via-card to-muted/30 shadow-(--shadow-md)">
      <div className={`flex flex-col gap-5 ${compact ? "p-4 md:flex-row md:items-end md:justify-between" : "p-5 md:flex-row md:items-end md:justify-between md:p-6"}`}>
        <div className="space-y-3">
          <Shimmer className="h-3 w-28" />
          <div className="space-y-2">
            <Shimmer className={compact ? "h-7 w-72 max-w-full" : "h-8 w-80 max-w-full"} />
            <Shimmer className={compact ? "h-4 w-full max-w-2xl" : "h-4 w-full max-w-3xl"} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Shimmer className="h-7 w-24 rounded-full" />
            <Shimmer className="h-7 w-32 rounded-full" />
            <Shimmer className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Shimmer className="h-9 w-24 rounded-full" />
          <Shimmer className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function DashboardContentShimmer() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-end">
        <Shimmer className="h-9 w-28" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <Shimmer className="h-4 w-24" />
            <Shimmer className="mt-3 h-7 w-32" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <Shimmer className="h-5 w-52" />
          <Shimmer className="mt-4 h-72 w-full" />
        </Card>
        <Card>
          <Shimmer className="h-5 w-44" />
          <Shimmer className="mt-4 h-72 w-full" />
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <Shimmer className="h-5 w-52" />
          <Shimmer className="mt-4 h-36 w-full" />
        </Card>
        <Card>
          <Shimmer className="h-5 w-40" />
          <Shimmer className="mt-4 h-36 w-full" />
        </Card>
      </div>

      <Card>
        <Shimmer className="h-5 w-44" />
        <Shimmer className="mt-4 h-56 w-full" />
      </Card>
    </div>
  );
}

export function SplitFormTableShimmer({ formTitleWidth = "w-40" }: { formTitleWidth?: string }) {
  return (
    <div className="grid gap-6 p-4 md:p-6 xl:grid-cols-3">
      <Card className="xl:col-span-1">
        <Shimmer className={`h-5 ${formTitleWidth}`} />
        <div className="mt-4 space-y-3">
          <Shimmer className="h-10 w-full" />
          <Shimmer className="h-10 w-full" />
          <Shimmer className="h-10 w-40" />
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <Shimmer className="h-5 w-44" />
        <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-xl border border-border/70">
            <div className="grid grid-cols-6 gap-3 border-b border-border/70 bg-muted/40 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="h-3 w-full" />
              ))}
            </div>
            <div className="space-y-2 bg-card p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-3 rounded-lg border border-border/60 p-3">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Shimmer key={j} className={j === 0 ? "h-3 w-16" : "h-3 w-full"} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Shimmer className="h-4 w-40" />
            <div className="flex gap-2">
              <Shimmer className="h-9 w-20 rounded-full" />
              <Shimmer className="h-9 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TablePageShimmer({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="border-b border-border/70 bg-muted/35 p-3">
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2 p-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-3 rounded-lg border border-border/60 p-3">
            {Array.from({ length: 6 }).map((_, j) => (
              <Shimmer key={j} className={j === 0 ? "h-3 w-20" : j === 4 ? "h-3 w-28" : "h-3 w-full"} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-3 py-3">
        <Shimmer className="h-4 w-44" />
        <div className="flex gap-2">
          <Shimmer className="h-9 w-24 rounded-full" />
          <Shimmer className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SingleCardPageShimmer({ titleWidth = "w-52", bodyHeight = "h-80" }: { titleWidth?: string; bodyHeight?: string }) {
  return (
    <div className="p-4 md:p-6">
      <Card>
        <Shimmer className={`h-5 ${titleWidth}`} />
        <Shimmer className={`mt-4 w-full ${bodyHeight}`} />
      </Card>
    </div>
  );
}

export function CompactCardPageShimmer({ titleWidth = "w-40" }: { titleWidth?: string }) {
  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-xl">
        <Shimmer className={`h-5 ${titleWidth}`} />
        <div className="mt-4 space-y-3">
          <Shimmer className="h-10 w-full" />
          <Shimmer className="h-10 w-full" />
          <Shimmer className="h-10 w-36" />
        </div>
      </Card>
    </div>
  );
}

export function AuthCardShimmer() {
  return (
    <Card className="w-full max-w-md">
      <Shimmer className="h-6 w-48" />
      <Shimmer className="mt-6 h-10 w-full" />
      <Shimmer className="mt-3 h-10 w-full" />
      <Shimmer className="mt-4 h-10 w-full" />
      <Shimmer className="mt-4 h-4 w-44" />
    </Card>
  );
}

