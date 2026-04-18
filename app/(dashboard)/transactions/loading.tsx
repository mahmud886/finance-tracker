import { Topbar } from "@/components/layout/topbar";
import { PageHeroShimmer, SplitFormTableShimmer } from "@/components/loading/page-shimmers";

export default function LoadingTransactionsPage() {
  return (
    <>
      <Topbar title="Transactions" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeroShimmer compact />
        <SplitFormTableShimmer formTitleWidth="w-44" />
      </div>
    </>
  );
}

