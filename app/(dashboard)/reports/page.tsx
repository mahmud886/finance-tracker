import { Topbar } from "@/components/layout/topbar";
import { Card, CardTitle } from "@/components/ui/card";
import { ReportTools } from "@/components/reports/report-tools";
import { getCategories, getProfile, getTransactions } from "@/lib/data";

export default async function ReportsPage() {
  const [profile, categories, transactions] = await Promise.all([
    getProfile(),
    getCategories(),
    getTransactions(500),
  ]);

  return (
    <>
      <Topbar title="Reports" />
      <div className="p-4 md:p-6">
        <Card>
          <CardTitle>Reports & Analytics</CardTitle>
          <div className="mt-4">
            <ReportTools transactions={transactions} categories={categories} currency={profile.currency} />
          </div>
        </Card>
      </div>
    </>
  );
}

