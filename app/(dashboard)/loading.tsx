import { Topbar } from "@/components/layout/topbar";
import { DashboardContentShimmer, PageHeroShimmer } from "@/components/loading/page-shimmers";

export default function LoadingDashboard() {
  return (
    <>
      <Topbar title="Loading" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeroShimmer />
        <DashboardContentShimmer />
      </div>
    </>
  );
}

