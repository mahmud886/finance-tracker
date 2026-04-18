"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CatalogDialogMode, CatalogGroupMode, CatalogGroupOption } from "@/components/plans/plans-types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

type Props = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  mode: CatalogDialogMode;
  isPending: boolean;
  selectedCatalogGroupKey: string;
  catalogGroupMode: CatalogGroupMode;
  catalogGroupOptions: CatalogGroupOption[];
  catalogGroupNameBn: string;
  catalogGroupNameEn: string;
  catalogItemNameBn: string;
  catalogItemNameEn: string;
  catalogDefaultUnit: string;
  catalogSortOrder: string;
  onCatalogGroupModeChangeAction: (mode: CatalogGroupMode) => void;
  onSelectedCatalogGroupChangeAction: (groupKey: string) => void;
  onCatalogGroupNameBnChangeAction: (value: string) => void;
  onCatalogGroupNameEnChangeAction: (value: string) => void;
  onCatalogItemNameBnChangeAction: (value: string) => void;
  onCatalogItemNameEnChangeAction: (value: string) => void;
  onCatalogDefaultUnitChangeAction: (value: string) => void;
  onCatalogSortOrderChangeAction: (value: string) => void;
  onSubmitAction: () => void;
};

export function CatalogItemDialog({
  open,
  onOpenChangeAction,
  mode,
  isPending,
  selectedCatalogGroupKey,
  catalogGroupMode,
  catalogGroupOptions,
  catalogGroupNameBn,
  catalogGroupNameEn,
  catalogItemNameBn,
  catalogItemNameEn,
  catalogDefaultUnit,
  catalogSortOrder,
  onCatalogGroupModeChangeAction,
  onSelectedCatalogGroupChangeAction,
  onCatalogGroupNameBnChangeAction,
  onCatalogGroupNameEnChangeAction,
  onCatalogItemNameBnChangeAction,
  onCatalogItemNameEnChangeAction,
  onCatalogDefaultUnitChangeAction,
  onCatalogSortOrderChangeAction,
  onSubmitAction,
}: Props) {
  const [groupSearch, setGroupSearch] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setGroupSearch("");
    }
    onOpenChangeAction(nextOpen);
  };

  const filteredCatalogGroupOptions = useMemo(() => {
    const query = normalizeText(groupSearch);
    if (!query) return catalogGroupOptions;

    return catalogGroupOptions.filter((group) => {
      const combined = `${group.group_name_bn} ${group.group_name_en} ${group.group_name_bn} | ${group.group_name_en}`;
      return normalizeText(combined).includes(query);
    });
  }, [catalogGroupOptions, groupSearch]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader>
        <DialogTitle>{mode === "update" ? "Update Catalog Item" : "Add Catalog Item"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-2 rounded-lg border p-1 md:grid-cols-2">
          <Button type="button" variant={catalogGroupMode === "existing" ? "default" : "ghost"} onClick={() => onCatalogGroupModeChangeAction("existing")} disabled={catalogGroupOptions.length === 0}>
            Existing group
          </Button>
          <Button type="button" variant={catalogGroupMode === "custom" ? "default" : "ghost"} onClick={() => onCatalogGroupModeChangeAction("custom")}>
            Custom group
          </Button>
        </div>

        {catalogGroupMode === "existing" ? (
          <div>
            <Label htmlFor="catalog-group-select">Group</Label>
            <Input
              id="catalog-group-search"
              className="mt-2"
              value={groupSearch}
              onChange={(event) => setGroupSearch(event.target.value)}
              placeholder="Search groups (BN or EN)"
            />
            <Select id="catalog-group-select" value={selectedCatalogGroupKey} onChange={(event) => onSelectedCatalogGroupChangeAction(event.target.value)} disabled={catalogGroupOptions.length === 0}>
              <option value="" disabled>
                {catalogGroupOptions.length === 0
                  ? "No groups available"
                  : filteredCatalogGroupOptions.length === 0
                    ? "No matching groups"
                    : "Select group"}
              </option>
              {filteredCatalogGroupOptions.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.group_name_bn} | {group.group_name_en}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="catalog-group-bn">Group name (BN)</Label>
              <Input id="catalog-group-bn" value={catalogGroupNameBn} onChange={(event) => onCatalogGroupNameBnChangeAction(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="catalog-group-en">Group name (EN)</Label>
              <Input id="catalog-group-en" value={catalogGroupNameEn} onChange={(event) => onCatalogGroupNameEnChangeAction(event.target.value)} />
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="catalog-item-bn">Item name (BN)</Label>
            <Input id="catalog-item-bn" value={catalogItemNameBn} onChange={(event) => onCatalogItemNameBnChangeAction(event.target.value)} placeholder="লাল আটা" />
          </div>
          <div>
            <Label htmlFor="catalog-item-en">Item name (EN)</Label>
            <Input id="catalog-item-en" value={catalogItemNameEn} onChange={(event) => onCatalogItemNameEnChangeAction(event.target.value)} placeholder="Red flour" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="catalog-unit">Default unit</Label>
            <Input id="catalog-unit" value={catalogDefaultUnit} onChange={(event) => onCatalogDefaultUnitChangeAction(event.target.value)} placeholder="kg" />
          </div>
          <div>
            <Label htmlFor="catalog-order">Sort order</Label>
            <Input id="catalog-order" type="number" value={catalogSortOrder} onChange={(event) => onCatalogSortOrderChangeAction(event.target.value)} />
          </div>
        </div>

        <Button type="button" onClick={onSubmitAction} disabled={isPending}>
          {isPending ? "Saving..." : mode === "update" ? "Update Catalog Item" : "Add Catalog Item"}
        </Button>
      </div>
    </Dialog>
  );
}



