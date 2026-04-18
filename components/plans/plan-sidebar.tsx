"use client";

import { useMemo, useState } from "react";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import type { BudgetTemplate, GroceryCatalogItem } from "@/types/app";


type Props = {
  templates: BudgetTemplate[];
  activeTemplate: BudgetTemplate | null;
  isPending: boolean;
  catalogItems: GroceryCatalogItem[];
  onCreatePlanAction: () => void;
  onEditPlanAction: () => void;
  onDeletePlanAction: () => void;
  onSelectTemplateAction: (templateId: string) => void;
  onCreateItemAction: () => void;
  onCreateCatalogItemAction: () => void;
  onEditCatalogItemAction: (item: GroceryCatalogItem) => void;
  onDeleteCatalogItemAction: (itemId: string) => void;
};

export function PlanSidebar({
  templates,
  activeTemplate,
  isPending,
  catalogItems,
  onCreatePlanAction,
  onEditPlanAction,
  onDeletePlanAction,
  onSelectTemplateAction,
  onCreateItemAction,
  onCreateCatalogItemAction,
  onEditCatalogItemAction,
  onDeleteCatalogItemAction,
}: Props) {
  const [currentCatalogPage, setCurrentCatalogPage] = useState(1);
  const [catalogPageSize, setCatalogPageSize] = useState(6);

  const totalCatalogPages = Math.max(1, Math.ceil(catalogItems.length / catalogPageSize));
  const safeCatalogPage = Math.min(currentCatalogPage, totalCatalogPages);
  const paginatedCatalogItems = useMemo(() => {
    const start = (safeCatalogPage - 1) * catalogPageSize;
    return catalogItems.slice(start, start + catalogPageSize);
  }, [catalogItems, catalogPageSize, safeCatalogPage]);

  return (
    <Card className="xl:col-span-1">
      <CardTitle>Monthly Plans</CardTitle>
      <div className="mt-4 space-y-3">
        <Button type="button" className="w-full" onClick={onCreatePlanAction}>
          Create Monthly Plan
        </Button>

        <Select value={activeTemplate?.id ?? ""} onChange={(event) => onSelectTemplateAction(event.target.value)}>
          <option value="" disabled>
            Select a plan
          </option>
          {templates.map((template) => (
            <option value={template.id} key={template.id}>
              {template.name} ({template.month})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={onEditPlanAction} disabled={!activeTemplate}>
            Edit Plan
          </Button>
          <Button type="button" variant="danger" onClick={onDeletePlanAction} disabled={!activeTemplate || isPending}>
            Delete Plan
          </Button>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={onCreateItemAction}>
          Add Item to Plan
        </Button>
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <CardTitle>Catalog Items</CardTitle>
          <Button type="button" size="sm" onClick={onCreateCatalogItemAction}>
            Add Catalog Item
          </Button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {paginatedCatalogItems.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.item_name_bn}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.group_name_bn} | {item.group_name_en}
                  </p>
                  {item.item_name_en ? <p className="text-xs text-muted-foreground">{item.item_name_en}</p> : null}
                  <p className="text-xs text-muted-foreground">Unit: {item.default_unit} · Order: {item.sort_order}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => onEditCatalogItemAction(item)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => onDeleteCatalogItemAction(item.id)} disabled={isPending}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {catalogItems.length === 0 ? <p className="text-sm text-muted-foreground">No catalog items yet.</p> : null}
        </div>
        <PaginationControls
          totalItems={catalogItems.length}
          currentPage={safeCatalogPage}
          pageSize={catalogPageSize}
          onPageChangeAction={setCurrentCatalogPage}
          onPageSizeChangeAction={setCatalogPageSize}
          pageSizeOptions={[4, 6, 8]}
          itemLabel="catalog items"
        />
      </div>
    </Card>
  );
}

