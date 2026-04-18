import { LoansWorkspace } from "@/components/loans/loans-workspace";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { getLoanPayments, getLoans, getProfile } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function LoansPage() {
  const [profile, loans, payments] = await Promise.all([getProfile(), getLoans(), getLoanPayments()]);
  const activeLoans = loans.filter((loan) => loan.status === "active").length;
  const totalPrincipal = loans.reduce((sum, loan) => sum + Number(loan.total_amount), 0);

  return (
    <>
      <Topbar title="Loans" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHero
          eyebrow="Loans"
          title="Track EMI progress with less friction"
          description="Monitor active loans, payment history, and remaining balances with a cleaner overview and improved action flow."
          badges={
            <>
              <Badge className="bg-soft-accent text-soft-accent-foreground">{activeLoans} active</Badge>
              <Badge className="bg-status-expense-bg text-status-expense-fg">{payments.length} payments</Badge>
              <Badge className="bg-status-income-bg text-status-income-fg">{formatCurrency(totalPrincipal, profile.currency)} total</Badge>
            </>
          }
        />

        <LoansWorkspace initialLoans={loans} initialPayments={payments} currency={profile.currency} />
      </div>
    </>
  );
}

