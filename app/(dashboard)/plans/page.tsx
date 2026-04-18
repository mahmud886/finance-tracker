import { format } from "date-fns";

import { PlansWorkspace } from "@/components/plans/plans-workspace";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { getBudgetTemplates, getCategories, getGroceryCatalogItems, getProfile, getTemplateItems } from "@/lib/data";

export default async function PlansPage() {
  const month = format(new Date(), "yyyy-MM");
  const [profile, categories, templates, items, catalogItems] = await Promise.all([
    getProfile(),
    getCategories(),
    getBudgetTemplates(month),
    getTemplateItems(),
    getGroceryCatalogItems(),
  ]);
  const activeItems = items.filter((item) => !item.is_purchased).length;

  return (
    <>
      <Topbar title="Plans" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHero
          eyebrow="Plans"
          title="Build smarter monthly grocery plans"
          description="Use the grocery catalog, custom entries, and plan actions in one organized workspace with clearer pacing and hierarchy."
          badges={
            <>
              <Badge className="bg-soft-accent text-soft-accent-foreground">{templates.length} templates</Badge>
              <Badge className="bg-status-income-bg text-status-income-fg">{items.length} items</Badge>
              <Badge className="bg-status-expense-bg text-status-expense-fg">{activeItems} pending</Badge>
            </>
          }
        />

        <PlansWorkspace
          initialTemplates={templates}
          initialItems={items}
          categories={categories}
          catalogItems={catalogItems}
          currency={profile.currency}
        />
      </div>
    </>
  );
}

