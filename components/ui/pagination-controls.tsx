"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type PaginationControlsProps = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChangeAction: (page: number) => void;
  onPageSizeChangeAction: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
};

export function PaginationControls({
  totalItems,
  currentPage,
  pageSize,
  onPageChangeAction,
  onPageSizeChangeAction,
  pageSizeOptions = [5, 10, 20],
  itemLabel = "items",
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startItem}</span>
        <span className="mx-1">-</span>
        <span className="font-medium text-foreground">{endItem}</span> of <span className="font-medium text-foreground">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows</span>
          <Select
            value={String(pageSize)}
            onChange={(event) => {
              onPageSizeChangeAction(Number(event.target.value));
              onPageChangeAction(1);
            }}
            className="h-9 w-24"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChangeAction(Math.max(safePage - 1, 1))} disabled={safePage <= 1}>
            Previous
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onPageChangeAction(Math.min(safePage + 1, totalPages))} disabled={safePage >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}


