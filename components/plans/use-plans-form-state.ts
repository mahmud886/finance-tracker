"use client";

import { useState } from "react";
import { format } from "date-fns";

import type { BudgetTemplate, Category, GroceryCatalogItem, TemplateItem } from "@/types/app";
import type {
  CatalogDialogMode,
  CatalogGroupMode,
  CatalogGroupOption,
  ItemDialogMode,
  ItemEntryMode,
  PlanDialogMode,
} from "@/components/plans/plans-types";

type Params = {
  categories: Category[];
  catalogItems: GroceryCatalogItem[];
};

export function usePlansFormState({ categories, catalogItems }: Params) {
  const [isItemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemDialogMode, setItemDialogMode] = useState<ItemDialogMode>("create");
  const [itemEntryMode, setItemEntryMode] = useState<ItemEntryMode>(catalogItems.length > 0 ? "catalog" : "custom");
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null);

  const [planDialogMode, setPlanDialogMode] = useState<PlanDialogMode>("create");
  const [editingPlan, setEditingPlan] = useState<BudgetTemplate | null>(null);

  const [isCatalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [catalogDialogMode, setCatalogDialogMode] = useState<CatalogDialogMode>("create");
  const [editingCatalogItem, setEditingCatalogItem] = useState<GroceryCatalogItem | null>(null);
  const [catalogGroupMode, setCatalogGroupMode] = useState<CatalogGroupMode>(catalogItems.length > 0 ? "existing" : "custom");
  const [selectedCatalogGroupKey, setSelectedCatalogGroupKey] = useState("");

  const [templateName, setTemplateName] = useState("Grocery");
  const [templateMonth, setTemplateMonth] = useState(format(new Date(), "yyyy-MM"));

  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState(catalogItems[0]?.id ?? "");
  const [customItemName, setCustomItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("pcs");
  const [itemPrice, setItemPrice] = useState("0");
  const [itemCategoryId, setItemCategoryId] = useState(categories[0]?.id ?? "");

  const [catalogGroupNameBn, setCatalogGroupNameBn] = useState("");
  const [catalogGroupNameEn, setCatalogGroupNameEn] = useState("");
  const [catalogItemNameBn, setCatalogItemNameBn] = useState("");
  const [catalogItemNameEn, setCatalogItemNameEn] = useState("");
  const [catalogDefaultUnit, setCatalogDefaultUnit] = useState("pcs");
  const [catalogSortOrder, setCatalogSortOrder] = useState("0");

  const selectedCatalogItem = catalogItems.find((item) => item.id === selectedCatalogItemId) ?? null;

  const catalogGroupOptions = Array.from(
    catalogItems.reduce<Map<string, CatalogGroupOption>>((acc, item) => {
      const key = `${item.group_name_bn} | ${item.group_name_en}`;
      if (!acc.has(key)) {
        acc.set(key, { key, group_name_bn: item.group_name_bn, group_name_en: item.group_name_en });
      }
      return acc;
    }, new Map()).values(),
  );

  const resetItemDialogState = (
    mode: ItemEntryMode = catalogItems.length > 0 ? "catalog" : "custom",
    dialogMode: ItemDialogMode = "create",
  ) => {
    setItemDialogMode(dialogMode);
    setItemEntryMode(mode);
    setCustomItemName("");
    setItemPrice("0");
    setItemQuantity("1");
    setItemCategoryId(categories[0]?.id ?? "");
    setEditingItem(null);

    if (mode === "catalog" && catalogItems[0]) {
      setSelectedCatalogItemId(catalogItems[0].id);
      setItemUnit(catalogItems[0].default_unit);
    }

    if (mode === "custom") {
      setSelectedCatalogItemId("");
      setItemUnit("pcs");
    }
  };

  const resetPlanDialogState = (dialogMode: PlanDialogMode = "create", template?: BudgetTemplate | null) => {
    setPlanDialogMode(dialogMode);
    setEditingPlan(template ?? null);

    if (dialogMode === "update" && template) {
      setTemplateName(template.name);
      setTemplateMonth(template.month);
      return;
    }

    setTemplateName("Grocery");
    setTemplateMonth(format(new Date(), "yyyy-MM"));
  };

  const resetCatalogDialogState = (dialogMode: CatalogDialogMode = "create", item?: GroceryCatalogItem | null) => {
    setCatalogDialogMode(dialogMode);
    setEditingCatalogItem(item ?? null);

    if (dialogMode === "update" && item) {
      const matchedGroupKey =
        catalogGroupOptions.find(
          (group) => group.group_name_bn === item.group_name_bn && group.group_name_en === item.group_name_en,
        )?.key ?? "";
      setCatalogGroupMode(matchedGroupKey ? "existing" : "custom");
      setSelectedCatalogGroupKey(matchedGroupKey);
      setCatalogGroupNameBn(item.group_name_bn);
      setCatalogGroupNameEn(item.group_name_en);
      setCatalogItemNameBn(item.item_name_bn);
      setCatalogItemNameEn(item.item_name_en ?? "");
      setCatalogDefaultUnit(item.default_unit);
      setCatalogSortOrder(String(item.sort_order));
      return;
    }

    const firstGroup = catalogGroupOptions[0] ?? null;
    setCatalogGroupMode(firstGroup ? "existing" : "custom");
    setSelectedCatalogGroupKey(firstGroup?.key ?? "");
    setCatalogGroupNameBn(firstGroup?.group_name_bn ?? "");
    setCatalogGroupNameEn(firstGroup?.group_name_en ?? "");
    setCatalogItemNameBn("");
    setCatalogItemNameEn("");
    setCatalogDefaultUnit("pcs");
    setCatalogSortOrder("0");
  };

  const switchCatalogGroupMode = (mode: CatalogGroupMode) => {
    setCatalogGroupMode(mode);

    if (mode === "existing") {
      const nextGroup =
        catalogGroupOptions.find((group) => group.key === selectedCatalogGroupKey) ?? catalogGroupOptions[0] ?? null;

      if (nextGroup) {
        setSelectedCatalogGroupKey(nextGroup.key);
        setCatalogGroupNameBn(nextGroup.group_name_bn);
        setCatalogGroupNameEn(nextGroup.group_name_en);
      }

      return;
    }

    setSelectedCatalogGroupKey("");
    setCatalogGroupNameBn("");
    setCatalogGroupNameEn("");
  };

  const selectCatalogGroup = (groupKey: string) => {
    setSelectedCatalogGroupKey(groupKey);
    const nextGroup = catalogGroupOptions.find((group) => group.key === groupKey);
    if (nextGroup) {
      setCatalogGroupNameBn(nextGroup.group_name_bn);
      setCatalogGroupNameEn(nextGroup.group_name_en);
    }
  };

  const switchItemEntryMode = (mode: ItemEntryMode) => {
    setItemEntryMode(mode);

    if (mode === "catalog") {
      const nextCatalogItem = selectedCatalogItem ?? catalogItems[0] ?? null;
      setCustomItemName("");

      if (nextCatalogItem) {
        setSelectedCatalogItemId(nextCatalogItem.id);
        setItemUnit(nextCatalogItem.default_unit);
      }

      return;
    }

    setSelectedCatalogItemId("");
    setCustomItemName(editingItem?.name ?? selectedCatalogItem?.item_name_bn ?? "");
    setItemUnit(editingItem?.unit ?? selectedCatalogItem?.default_unit ?? "pcs");
  };

  return {
    isItemDialogOpen,
    setItemDialogOpen,
    itemDialogMode,
    setItemDialogMode,
    itemEntryMode,
    setItemEntryMode,
    editingItem,
    setEditingItem,
    planDialogMode,
    setPlanDialogMode,
    editingPlan,
    setEditingPlan,
    isCatalogDialogOpen,
    setCatalogDialogOpen,
    catalogDialogMode,
    setCatalogDialogMode,
    editingCatalogItem,
    setEditingCatalogItem,
    catalogGroupMode,
    setCatalogGroupMode,
    selectedCatalogGroupKey,
    setSelectedCatalogGroupKey,
    templateName,
    setTemplateName,
    templateMonth,
    setTemplateMonth,
    selectedCatalogItemId,
    setSelectedCatalogItemId,
    customItemName,
    setCustomItemName,
    itemQuantity,
    setItemQuantity,
    itemUnit,
    setItemUnit,
    itemPrice,
    setItemPrice,
    itemCategoryId,
    setItemCategoryId,
    catalogGroupNameBn,
    setCatalogGroupNameBn,
    catalogGroupNameEn,
    setCatalogGroupNameEn,
    catalogItemNameBn,
    setCatalogItemNameBn,
    catalogItemNameEn,
    setCatalogItemNameEn,
    catalogDefaultUnit,
    setCatalogDefaultUnit,
    catalogSortOrder,
    setCatalogSortOrder,
    selectedCatalogItem,
    catalogGroupOptions,
    resetItemDialogState,
    resetPlanDialogState,
    resetCatalogDialogState,
    switchCatalogGroupMode,
    selectCatalogGroup,
    switchItemEntryMode,
  };
}


