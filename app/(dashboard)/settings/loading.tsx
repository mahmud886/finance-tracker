import { Topbar } from "@/components/layout/topbar";
import { CompactCardPageShimmer, PageHeroShimmer } from "@/components/loading/page-shimmers";

export default function LoadingSettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeroShimmer compact />
        <CompactCardPageShimmer titleWidth="w-32" />
      </div>
    </>
  );
}

