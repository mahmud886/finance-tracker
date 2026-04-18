import { Topbar } from "@/components/layout/topbar";
import { PageHeroShimmer, SplitFormTableShimmer, TablePageShimmer } from "@/components/loading/page-shimmers";

export default function LoadingLoansPage() {
  return (
    <>
      <Topbar title="Loans" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeroShimmer compact />
        <div className="grid gap-6 xl:grid-cols-3">
          <SplitFormTableShimmer formTitleWidth="w-32" />
          <div className="space-y-4 xl:col-span-2">
            <TablePageShimmer rows={6} />
            <TablePageShimmer rows={5} />
          </div>
        </div>
      </div>
    </>
  );
}

