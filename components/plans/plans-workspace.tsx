"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createBudgetTemplate,
  createGroceryCatalogItem,
  createTemplateItem,
  deleteTemplateItem,
  deleteBudgetTemplate,
  deleteGroceryCatalogItem,
  updateBudgetTemplate,
  updateGroceryCatalogItem,
  updateTemplateItem,
  toggleTemplateItemPurchased,
} from "@/lib/actions/plans";
import { CatalogItemDialog } from "@/components/plans/catalog-item-dialog";
import { PlanItemsTable } from "@/components/plans/plan-items-table";
import { PlanSidebar } from "@/components/plans/plan-sidebar";
import { PlanSummaryPanels } from "@/components/plans/plan-summary-panels";
import { PlanTemplateDialog } from "@/components/plans/plan-template-dialog";
import { PlanItemDialog } from "@/components/plans/plan-item-dialog";
import { usePlansFormState } from "@/components/plans/use-plans-form-state";
import { usePlanStore } from "@/store/plan-store";
import { useUIStore } from "@/store/ui-store";
import type { BudgetTemplate, Category, GroceryCatalogItem, TemplateItem } from "@/types/app";
import type { ItemEntryMode } from "@/components/plans/plans-types";

type Props = {
  initialTemplates: BudgetTemplate[];
  initialItems: TemplateItem[];
  categories: Category[];
  catalogItems: GroceryCatalogItem[];
  currency: string;
};

export function PlansWorkspace({ initialTemplates, initialItems, categories, catalogItems, currency }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const templates = usePlanStore((state) => state.templates);
  const itemsByTemplateId = usePlanStore((state) => state.templateItemsByTemplateId);
  const activeTemplateId = usePlanStore((state) => state.activeTemplateId);
  const setTemplates = usePlanStore((state) => state.setTemplates);
  const setTemplateItems = usePlanStore((state) => state.setTemplateItems);
  const setActiveTemplate = usePlanStore((state) => state.setActiveTemplate);

  const isPlanDialogOpen = useUIStore((state) => state.isPlanDialogOpen);
  const setPlanDialogOpen = useUIStore((state) => state.setPlanDialogOpen);
  const {
    isItemDialogOpen,
    setItemDialogOpen,
    itemDialogMode,
    setItemDialogMode,
    itemEntryMode,
    setItemEntryMode,
    editingItem,
    setEditingItem,
    planDialogMode,
    editingPlan,
    isCatalogDialogOpen,
    setCatalogDialogOpen,
    catalogDialogMode,
    editingCatalogItem,
    catalogGroupMode,
    selectedCatalogGroupKey,
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
  } = usePlansFormState({ categories, catalogItems });

  const isCustomItem = itemEntryMode === "custom";
  const isEditingItem = itemDialogMode === "update";

  const openCreatePlanDialog = () => {
    resetPlanDialogState("create");
    setPlanDialogOpen(true);
  };

  const openEditPlanDialog = () => {
    if (!activeTemplate) {
      toast.error("Select a plan first");
      return;
    }

    resetPlanDialogState("update", activeTemplate);
    setPlanDialogOpen(true);
  };

  const openCreateItemDialog = (mode: ItemEntryMode = catalogItems.length > 0 ? "catalog" : "custom") => {
    resetItemDialogState(mode, "create");
    setItemDialogOpen(true);
  };

  const openCreateCatalogDialog = () => {
    resetCatalogDialogState("create");
    setCatalogDialogOpen(true);
  };

  const openEditCatalogDialog = (item: GroceryCatalogItem) => {
    resetCatalogDialogState("update", item);
    setCatalogDialogOpen(true);
  };


  const openEditItemDialog = (item: TemplateItem) => {
    const matchedCatalogItem = catalogItems.find(
      (catalogItem) => catalogItem.item_name_bn === item.name || catalogItem.item_name_en === item.name,
    );

    setItemDialogMode("update");
    setEditingItem(item);
    setItemQuantity(String(item.quantity));
    setItemPrice(String(item.estimated_price));
    setItemCategoryId(item.category_id ?? categories[0]?.id ?? "");

    if (matchedCatalogItem) {
      setItemEntryMode("catalog");
      setSelectedCatalogItemId(matchedCatalogItem.id);
      setItemUnit(matchedCatalogItem.default_unit);
      setCustomItemName("");
    } else {
      setItemEntryMode("custom");
      setSelectedCatalogItemId("");
      setCustomItemName(item.name);
      setItemUnit(item.unit);
    }

    setItemDialogOpen(true);
  };


  useEffect(() => {
    setTemplates(initialTemplates);

    const grouped = initialItems.reduce<Record<string, TemplateItem[]>>((acc, item) => {
      if (!acc[item.template_id]) {
        acc[item.template_id] = [];
      }
      acc[item.template_id].push(item);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([templateId, items]) => {
      setTemplateItems(templateId, items);
    });

    if (!activeTemplateId && initialTemplates.length > 0) {
      setActiveTemplate(initialTemplates[0].id);
    }
  }, [activeTemplateId, initialItems, initialTemplates, setActiveTemplate, setTemplateItems, setTemplates]);

  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? templates[0] ?? null;

  const activeItems = activeTemplate ? (itemsByTemplateId[activeTemplate.id] ?? []) : [];

  const totalPlanned = activeItems.reduce((sum, item) => sum + Number(item.estimated_price), 0);
  const totalSpent = activeItems
    .filter((item) => item.is_purchased)
    .reduce((sum, item) => sum + Number(item.estimated_price), 0);
  const completion = activeItems.length === 0 ? 0 : (activeItems.filter((item) => item.is_purchased).length / activeItems.length) * 100;

  const progressMap = new Map<string, { completed: number; total: number }>();

  activeItems.forEach((item) => {
    const key = item.category?.name ?? "Uncategorized";
    const current = progressMap.get(key) ?? { completed: 0, total: 0 };
    current.total += 1;
    if (item.is_purchased) current.completed += 1;
    progressMap.set(key, current);
  });

  const progressByCategory = Array.from(progressMap.entries()).map(([name, value]) => ({
    name,
    completion: value.total === 0 ? 0 : (value.completed / value.total) * 100,
    completed: value.completed,
    total: value.total,
  }));

  const onCreateTemplate = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", templateName);
        formData.set("month", templateMonth);
        if (planDialogMode === "update" && editingPlan) {
          formData.set("id", editingPlan.id);
          await updateBudgetTemplate(formData);
          toast.success("Plan updated");
        } else {
          await createBudgetTemplate(formData);
          toast.success("Plan created");
        }
        setPlanDialogOpen(false);
        resetPlanDialogState("create");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : planDialogMode === "update" ? "Failed to update plan" : "Failed to create plan");
      }
    });
  };

  const onDeletePlan = () => {
    if (!activeTemplate) {
      toast.error("Select a plan first");
      return;
    }

    if (!window.confirm(`Delete plan "${activeTemplate.name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", activeTemplate.id);
        await deleteBudgetTemplate(formData);

        const nextTemplate = templates.find((template) => template.id !== activeTemplate.id) ?? null;
        setActiveTemplate(nextTemplate?.id ?? null);
        setPlanDialogOpen(false);
        resetPlanDialogState("create");
        toast.success("Plan deleted");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete plan");
      }
    });
  };

  const onSaveItem = () => {
    if (!activeTemplate) {
      toast.error("Create or select a plan first");
      return;
    }

    startTransition(async () => {
      try {
        const selectedName = isCustomItem ? customItemName.trim() : selectedCatalogItem?.item_name_bn ?? "";
        if (!selectedName) {
          toast.error(isCustomItem ? "Enter a custom item name" : "Select an item from the list");
          return;
        }

        if (isEditingItem && !editingItem) {
          toast.error("Missing item to update");
          return;
        }

        const formData = new FormData();
        if (isEditingItem && editingItem) {
          formData.set("id", editingItem.id);
        }
        formData.set("template_id", activeTemplate.id);
        formData.set("name", selectedName);
        formData.set("quantity", itemQuantity);
        formData.set("unit", itemUnit);
        formData.set("estimated_price", itemPrice);
        formData.set("category_id", itemCategoryId);
        if (isEditingItem) {
          await updateTemplateItem(formData);
          toast.success("Plan item updated");
        } else {
          await createTemplateItem(formData);
          toast.success("Plan item added");
        }
        setItemDialogOpen(false);
        resetItemDialogState(catalogItems.length > 0 ? "catalog" : "custom", "create");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : isEditingItem ? "Failed to update plan item" : "Failed to add plan item");
      }
    });
  };

  const onToggleItem = (item: TemplateItem, checked: boolean) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", item.id);
        formData.set("checked", String(checked));
        await toggleTemplateItemPurchased(formData);
        toast.success(checked ? "Marked as purchased" : "Marked as pending");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update item");
      }
    });
  };

  const onDeleteItem = (itemId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", itemId);
        await deleteTemplateItem(formData);
        toast.success("Item deleted");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete item");
      }
    });
  };

  const onSaveCatalogItem = () => {
    startTransition(async () => {
      try {
        const resolvedGroupBn = catalogGroupMode === "existing" ? catalogGroupNameBn.trim() : catalogGroupNameBn.trim();
        const resolvedGroupEn = catalogGroupMode === "existing" ? catalogGroupNameEn.trim() : catalogGroupNameEn.trim();

        if (!resolvedGroupBn || !resolvedGroupEn) {
          toast.error("Select an existing group or enter a custom group");
          return;
        }

        const formData = new FormData();
        formData.set("group_name_bn", resolvedGroupBn);
        formData.set("group_name_en", resolvedGroupEn);
        formData.set("item_name_bn", catalogItemNameBn);
        formData.set("item_name_en", catalogItemNameEn);
        formData.set("default_unit", catalogDefaultUnit);
        formData.set("sort_order", catalogSortOrder);

        if (catalogDialogMode === "update" && editingCatalogItem) {
          formData.set("id", editingCatalogItem.id);
          await updateGroceryCatalogItem(formData);
          toast.success("Catalog item updated");
        } else {
          await createGroceryCatalogItem(formData);
          toast.success("Catalog item added");
        }

        setCatalogDialogOpen(false);
        resetCatalogDialogState("create");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : catalogDialogMode === "update" ? "Failed to update catalog item" : "Failed to add catalog item");
      }
    });
  };

  const onDeleteCatalogItem = (itemId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", itemId);
        await deleteGroceryCatalogItem(formData);
        toast.success("Catalog item deleted");
        if (selectedCatalogItemId === itemId) {
          setSelectedCatalogItemId(catalogItems.find((item) => item.id !== itemId)?.id ?? "");
        }
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete catalog item");
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <PlanSidebar
        templates={templates}
        activeTemplate={activeTemplate}
        isPending={isPending}
        catalogItems={catalogItems}
        onCreatePlanAction={openCreatePlanDialog}
        onEditPlanAction={openEditPlanDialog}
        onDeletePlanAction={onDeletePlan}
        onSelectTemplateAction={(templateId) => setActiveTemplate(templateId)}
        onCreateItemAction={() => openCreateItemDialog()}
        onCreateCatalogItemAction={openCreateCatalogDialog}
        onEditCatalogItemAction={openEditCatalogDialog}
        onDeleteCatalogItemAction={onDeleteCatalogItem}
      />

      <div className="space-y-4 xl:col-span-2">
        <PlanSummaryPanels totalPlanned={totalPlanned} totalSpent={totalSpent} completion={completion} currency={currency} progressByCategory={progressByCategory} />

        <PlanItemsTable
          activeItems={activeItems}
          currency={currency}
          isPending={isPending}
          onToggleItemAction={onToggleItem}
          onEditItemAction={openEditItemDialog}
          onDeleteItemAction={onDeleteItem}
        />
      </div>

      <PlanTemplateDialog
        open={isPlanDialogOpen}
        onOpenChange={setPlanDialogOpen}
        mode={planDialogMode}
        isPending={isPending}
        templateName={templateName}
        templateMonth={templateMonth}
        onTemplateNameChange={setTemplateName}
        onTemplateMonthChange={setTemplateMonth}
        onSubmit={onCreateTemplate}
      />

      <PlanItemDialog
        open={isItemDialogOpen}
        onOpenChange={setItemDialogOpen}
        mode={itemDialogMode}
        isPending={isPending}
        catalogItems={catalogItems}
        categories={categories}
        itemEntryMode={itemEntryMode}
        selectedCatalogItemId={selectedCatalogItemId}
        customItemName={customItemName}
        itemQuantity={itemQuantity}
        itemUnit={itemUnit}
        itemPrice={itemPrice}
        itemCategoryId={itemCategoryId}
        onCatalogModeChange={switchItemEntryMode}
        onSelectedCatalogItemChange={(nextId) => {
          setSelectedCatalogItemId(nextId);
          const nextItem = catalogItems.find((item) => item.id === nextId);
          if (nextItem) setItemUnit(nextItem.default_unit);
        }}
        onCustomItemNameChange={setCustomItemName}
        onItemQuantityChange={setItemQuantity}
        onItemUnitChange={setItemUnit}
        onItemPriceChange={setItemPrice}
        onItemCategoryChange={setItemCategoryId}
        onSubmit={onSaveItem}
      />

      <CatalogItemDialog
        open={isCatalogDialogOpen}
        onOpenChangeAction={setCatalogDialogOpen}
        mode={catalogDialogMode}
        isPending={isPending}
        selectedCatalogGroupKey={selectedCatalogGroupKey}
        catalogGroupMode={catalogGroupMode}
        catalogGroupOptions={catalogGroupOptions}
        catalogGroupNameBn={catalogGroupNameBn}
        catalogGroupNameEn={catalogGroupNameEn}
        catalogItemNameBn={catalogItemNameBn}
        catalogItemNameEn={catalogItemNameEn}
        catalogDefaultUnit={catalogDefaultUnit}
        catalogSortOrder={catalogSortOrder}
        onCatalogGroupModeChangeAction={switchCatalogGroupMode}
        onSelectedCatalogGroupChangeAction={selectCatalogGroup}
        onCatalogGroupNameBnChangeAction={setCatalogGroupNameBn}
        onCatalogGroupNameEnChangeAction={setCatalogGroupNameEn}
        onCatalogItemNameBnChangeAction={setCatalogItemNameBn}
        onCatalogItemNameEnChangeAction={setCatalogItemNameEn}
        onCatalogDefaultUnitChangeAction={setCatalogDefaultUnit}
        onCatalogSortOrderChangeAction={setCatalogSortOrder}
        onSubmitAction={onSaveCatalogItem}
      />
    </div>
  );
}

