import { Topbar } from "@/components/layout/topbar";
import { PageHeroShimmer, SplitFormTableShimmer } from "@/components/loading/page-shimmers";

export default function LoadingPlansPage() {
  return (
    <>
      <Topbar title="Plans" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeroShimmer compact />
        <SplitFormTableShimmer formTitleWidth="w-40" />
      </div>
    </>
  );
}

