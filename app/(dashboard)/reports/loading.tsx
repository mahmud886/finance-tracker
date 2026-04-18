import { Topbar } from "@/components/layout/topbar";
import { PageHeroShimmer, SingleCardPageShimmer } from "@/components/loading/page-shimmers";

export default function LoadingReportsPage() {
  return (
    <>
      <Topbar title="Reports" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeroShimmer compact />
        <SingleCardPageShimmer titleWidth="w-48" bodyHeight="h-[28rem]" />
      </div>
    </>
  );
}

