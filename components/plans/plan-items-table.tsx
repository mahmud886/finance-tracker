"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { TemplateItem } from "@/types/app";

type Props = {
  activeItems: TemplateItem[];
  currency: string;
  isPending: boolean;
  onToggleItemAction: (item: TemplateItem, checked: boolean) => void;
  onEditItemAction: (item: TemplateItem) => void;
  onDeleteItemAction: (itemId: string) => void;
};

export function PlanItemsTable({ activeItems, currency, isPending, onToggleItemAction, onEditItemAction, onDeleteItemAction }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return activeItems.slice(start, start + pageSize);
  }, [activeItems, pageSize, safePage]);

  return (
    <Card>
      <CardTitle>Checklist</CardTitle>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
        <Table className="min-w-180">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-12">Done</TableHeaderCell>
              <TableHeaderCell>Item</TableHeaderCell>
              <TableHeaderCell>Qty</TableHeaderCell>
              <TableHeaderCell>Unit</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Est. Price</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox checked={item.is_purchased} onChange={(event) => onToggleItemAction(item, event.target.checked)} />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.category?.name ?? "-"}</TableCell>
                <TableCell>{formatCurrency(Number(item.estimated_price), currency)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => onEditItemAction(item)} disabled={isPending}>
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="danger" onClick={() => onDeleteItemAction(item.id)} disabled={isPending}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {activeItems.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No checklist items yet.</p> : null}
      </div>
      <PaginationControls
        totalItems={activeItems.length}
        currentPage={safePage}
        pageSize={pageSize}
        onPageChangeAction={setCurrentPage}
        onPageSizeChangeAction={setPageSize}
        itemLabel="items"
      />
    </Card>
  );
}

