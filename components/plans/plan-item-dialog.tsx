"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ItemDialogMode, ItemEntryMode } from "@/components/plans/plans-types";
import type { Category, GroceryCatalogItem } from "@/types/app";


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ItemDialogMode;
  isPending: boolean;
  catalogItems: GroceryCatalogItem[];
  categories: Category[];
  itemEntryMode: ItemEntryMode;
  selectedCatalogItemId: string;
  customItemName: string;
  itemQuantity: string;
  itemUnit: string;
  itemPrice: string;
  itemCategoryId: string;
  onCatalogModeChange: (mode: ItemEntryMode) => void;
  onSelectedCatalogItemChange: (value: string) => void;
  onCustomItemNameChange: (value: string) => void;
  onItemQuantityChange: (value: string) => void;
  onItemUnitChange: (value: string) => void;
  onItemPriceChange: (value: string) => void;
  onItemCategoryChange: (value: string) => void;
  onSubmit: () => void;
};

export function PlanItemDialog({
  open,
  onOpenChange,
  mode,
  isPending,
  catalogItems,
  categories,
  itemEntryMode,
  selectedCatalogItemId,
  customItemName,
  itemQuantity,
  itemUnit,
  itemPrice,
  itemCategoryId,
  onCatalogModeChange,
  onSelectedCatalogItemChange,
  onCustomItemNameChange,
  onItemQuantityChange,
  onItemUnitChange,
  onItemPriceChange,
  onItemCategoryChange,
  onSubmit,
}: Props) {
  const catalogGroups = catalogItems.reduce<Record<string, GroceryCatalogItem[]>>((acc, item) => {
    const key = `${item.group_name_bn} | ${item.group_name_en}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const isCustomItem = itemEntryMode === "custom";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{mode === "update" ? "Update Plan Item" : "Add Plan Item"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-2 rounded-lg border p-1">
          <Button type="button" variant={itemEntryMode === "catalog" ? "default" : "ghost"} onClick={() => onCatalogModeChange("catalog")} disabled={catalogItems.length === 0}>
            Catalog
          </Button>
          <Button type="button" variant={itemEntryMode === "custom" ? "default" : "ghost"} onClick={() => onCatalogModeChange("custom")}>
            Custom
          </Button>
        </div>

        <div>
          {isCustomItem ? (
            <>
              <Label htmlFor="custom-item-name">Custom item name</Label>
              <Input id="custom-item-name" value={customItemName} onChange={(event) => onCustomItemNameChange(event.target.value)} placeholder="Enter item name" />
            </>
          ) : (
            <>
              <Label htmlFor="item-name">Item name (dropdown)</Label>
              <Select id="item-name" value={selectedCatalogItemId} onChange={(event) => onSelectedCatalogItemChange(event.target.value)} disabled={catalogItems.length === 0}>
                <option value="" disabled>
                  {catalogItems.length === 0 ? "No catalog items available" : "Select a grocery item"}
                </option>
                {Object.entries(catalogGroups).map(([groupLabel, items]) => (
                  <optgroup key={groupLabel} label={groupLabel}>
                    {items.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.item_name_bn}
                        {item.item_name_en ? ` (${item.item_name_en})` : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              {catalogItems.length === 0 ? <p className="mt-1 text-xs text-muted-foreground">Catalog is empty. Add items in `grocery_catalog_items`.</p> : null}
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="item-qty">Quantity</Label>
            <Input id="item-qty" value={itemQuantity} onChange={(event) => onItemQuantityChange(event.target.value)} type="number" step="0.01" />
          </div>
          <div>
            <Label htmlFor="item-unit">Unit</Label>
            <Input id="item-unit" value={itemUnit} onChange={(event) => onItemUnitChange(event.target.value)} placeholder="kg" />
          </div>
          <div>
            <Label htmlFor="item-price">Est. price</Label>
            <Input id="item-price" value={itemPrice} onChange={(event) => onItemPriceChange(event.target.value)} type="number" step="0.01" />
          </div>
        </div>

        <div>
          <Label htmlFor="item-category">Category</Label>
          <Select id="item-category" value={itemCategoryId} onChange={(event) => onItemCategoryChange(event.target.value)}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <Button type="button" onClick={onSubmit} disabled={isPending}>
          {isPending ? "Saving..." : mode === "update" ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </Dialog>
  );
}

