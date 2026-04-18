"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createLoan, createLoanPayment, deleteLoan, deleteLoanPayment, markLoanEmiPaid } from "@/lib/actions/loans";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLoanStore } from "@/store/loan-store";
import { useUIStore } from "@/store/ui-store";
import type { Loan, LoanPayment } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

type Props = {
  initialLoans: Loan[];
  initialPayments: LoanPayment[];
  currency: string;
};

export function LoansWorkspace({ initialLoans, initialPayments, currency }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const loans = useLoanStore((state) => state.loans);
  const paymentsByLoanId = useLoanStore((state) => state.paymentsByLoanId);
  const selectedLoanId = useLoanStore((state) => state.selectedLoanId);
  const setLoans = useLoanStore((state) => state.setLoans);
  const setLoanPayments = useLoanStore((state) => state.setLoanPayments);
  const setSelectedLoan = useLoanStore((state) => state.setSelectedLoan);

  const isLoanDialogOpen = useUIStore((state) => state.isLoanDialogOpen);
  const setLoanDialogOpen = useUIStore((state) => state.setLoanDialogOpen);

  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const [loanName, setLoanName] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");
  const [interestRate, setInterestRate] = useState("0");
  const [installment, setInstallment] = useState("0");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDay, setDueDay] = useState("1");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNote, setPaymentNote] = useState("");
  const [currentLoanPage, setCurrentLoanPage] = useState(1);
  const [loanPageSize, setLoanPageSize] = useState(10);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);

  useEffect(() => {
    setLoans(initialLoans);

    const grouped = initialPayments.reduce<Record<string, LoanPayment[]>>((acc, payment) => {
      if (!acc[payment.loan_id]) {
        acc[payment.loan_id] = [];
      }
      acc[payment.loan_id].push(payment);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([loanId, payments]) => {
      setLoanPayments(loanId, payments);
    });

    if (!selectedLoanId && initialLoans.length > 0) {
      setSelectedLoan(initialLoans[0].id);
    }
  }, [initialLoans, initialPayments, selectedLoanId, setLoanPayments, setLoans, setSelectedLoan]);

  const selectedLoan = useMemo(
    () => loans.find((loan) => loan.id === selectedLoanId) ?? loans[0] ?? null,
    [loans, selectedLoanId],
  );

  const selectedPayments = useMemo(
    () => (selectedLoan ? (paymentsByLoanId[selectedLoan.id] ?? []) : []),
    [paymentsByLoanId, selectedLoan],
  );

  const selectedLoanSummary = useMemo(() => {
    if (!selectedLoan) return null;

    const principal = Number(selectedLoan.total_amount);
    const totalPayable = principal + principal * (Number(selectedLoan.interest_rate) / 100);
    const paid = selectedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remaining = Math.max(totalPayable - paid, 0);
    const completion = totalPayable > 0 ? (paid / totalPayable) * 100 : 0;

    return { totalPayable, paid, remaining, completion };
  }, [selectedLoan, selectedPayments]);

  const totalLoanPages = Math.max(1, Math.ceil(loans.length / loanPageSize));
  const safeLoanPage = Math.min(currentLoanPage, totalLoanPages);
  const paginatedLoans = useMemo(() => {
    const start = (safeLoanPage - 1) * loanPageSize;
    return loans.slice(start, start + loanPageSize);
  }, [safeLoanPage, loanPageSize, loans]);

  const totalPaymentPages = Math.max(1, Math.ceil(selectedPayments.length / paymentPageSize));
  const safePaymentPage = Math.min(currentPaymentPage, totalPaymentPages);
  const paginatedPayments = useMemo(() => {
    const start = (safePaymentPage - 1) * paymentPageSize;
    return selectedPayments.slice(start, start + paymentPageSize);
  }, [paymentPageSize, safePaymentPage, selectedPayments]);

  const onCreateLoan = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", loanName);
        formData.set("total_amount", totalAmount);
        formData.set("interest_rate", interestRate);
        formData.set("monthly_installment", installment);
        formData.set("start_date", startDate);
        formData.set("due_day", dueDay);
        await createLoan(formData);
        toast.success("Loan added");
        setLoanDialogOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create loan");
      }
    });
  };

  const onMarkEmiPaid = () => {
    if (!selectedLoan) {
      toast.error("Select a loan first");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("loan_id", selectedLoan.id);
        await markLoanEmiPaid(formData);
        toast.success("EMI marked as paid");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to mark EMI");
      }
    });
  };

  const onCreatePayment = () => {
    if (!selectedLoan) {
      toast.error("Select a loan first");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("loan_id", selectedLoan.id);
        if (paymentAmount) formData.set("amount", paymentAmount);
        formData.set("paid_on", paymentDate);
        formData.set("note", paymentNote);
        await createLoanPayment(formData);
        toast.success("Payment recorded");
        setPaymentDialogOpen(false);
        setPaymentAmount("");
        setPaymentNote("");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to record payment");
      }
    });
  };

  const onDeleteLoan = (loanId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", loanId);
        await deleteLoan(formData);
        toast.success("Loan removed");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove loan");
      }
    });
  };

  const onDeletePayment = (paymentId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", paymentId);
        await deleteLoanPayment(formData);
        toast.success("Payment removed");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove payment");
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-1">
        <CardTitle>Loan Accounts</CardTitle>
        <div className="mt-4 space-y-3">
          <Button type="button" className="w-full" onClick={() => setLoanDialogOpen(true)}>
            Add Loan
          </Button>

          <Select
            value={selectedLoan?.id ?? ""}
            onChange={(event) => {
              setSelectedLoan(event.target.value);
              setCurrentPaymentPage(1);
            }}
          >
            <option value="" disabled>
              Select a loan
            </option>
            {loans.map((loan) => (
              <option value={loan.id} key={loan.id}>
                {loan.name}
              </option>
            ))}
          </Select>

          <Button type="button" variant="outline" className="w-full" onClick={onMarkEmiPaid} disabled={!selectedLoan || isPending}>
            Mark EMI Paid
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={() => setPaymentDialogOpen(true)} disabled={!selectedLoan}>
            Add Custom Payment
          </Button>
        </div>
      </Card>

      <div className="space-y-4 xl:col-span-2">
        <Card>
          <CardTitle>Loan Summary</CardTitle>
          {selectedLoan && selectedLoanSummary ? (
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payable</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedLoanSummary.totalPayable, currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedLoanSummary.paid, currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedLoanSummary.remaining, currency)}</p>
                </div>
              </div>
              <Progress value={selectedLoanSummary.completion} />
              <p className="text-xs text-muted-foreground">Progress: {selectedLoanSummary.completion.toFixed(1)}%</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No loan selected.</p>
          )}
        </Card>

        <Card>
          <CardTitle>Loans</CardTitle>
          <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
            <Table className="min-w-180">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                  <TableHeaderCell>Interest %</TableHeaderCell>
                  <TableHeaderCell>Monthly EMI</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLoans.map((loan) => (
                  <TableRow key={loan.id} className={loan.id === selectedLoan?.id ? "bg-muted/55" : ""}>
                    <TableCell>{loan.name}</TableCell>
                    <TableCell>{formatCurrency(Number(loan.total_amount), currency)}</TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>{formatCurrency(Number(loan.monthly_installment), currency)}</TableCell>
                    <TableCell>{loan.status}</TableCell>
                    <TableCell>
                      <Button type="button" size="sm" variant="danger" onClick={() => onDeleteLoan(loan.id)} disabled={isPending}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loans.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No loans yet.</p> : null}
          </div>
          <PaginationControls
            totalItems={loans.length}
            currentPage={safeLoanPage}
            pageSize={loanPageSize}
            onPageChangeAction={setCurrentLoanPage}
            onPageSizeChangeAction={setLoanPageSize}
            itemLabel="loans"
          />
        </Card>

        <Card>
          <CardTitle>Payment History</CardTitle>
          <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
            <Table className="min-w-180">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Note</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paid_on)}</TableCell>
                    <TableCell>{formatCurrency(Number(payment.amount), currency)}</TableCell>
                    <TableCell>{payment.note ?? "-"}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => onDeletePayment(payment.id)}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {selectedPayments.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No payments yet.</p> : null}
          </div>
          <PaginationControls
            totalItems={selectedPayments.length}
            currentPage={safePaymentPage}
            pageSize={paymentPageSize}
            onPageChangeAction={setCurrentPaymentPage}
            onPageSizeChangeAction={setPaymentPageSize}
            itemLabel="payments"
          />
        </Card>
      </div>

      <Dialog open={isLoanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogHeader>
          <DialogTitle>Add Loan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="loan-name">Loan name</Label>
            <Input id="loan-name" value={loanName} onChange={(event) => setLoanName(event.target.value)} placeholder="Home loan" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="loan-total">Total amount</Label>
              <Input id="loan-total" type="number" step="0.01" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="loan-interest">Interest %</Label>
              <Input id="loan-interest" type="number" step="0.01" value={interestRate} onChange={(event) => setInterestRate(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="loan-emi">Monthly EMI</Label>
              <Input id="loan-emi" type="number" step="0.01" value={installment} onChange={(event) => setInstallment(event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="loan-start">Start date</Label>
              <Input id="loan-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="loan-day">Due day</Label>
              <Input id="loan-day" type="number" min={1} max={31} value={dueDay} onChange={(event) => setDueDay(event.target.value)} />
            </div>
          </div>
          <Button type="button" onClick={onCreateLoan} disabled={isPending}>
            {isPending ? "Saving..." : "Create Loan"}
          </Button>
        </div>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogHeader>
          <DialogTitle>Add Loan Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="payment-amount">Amount (leave blank for EMI amount)</Label>
            <Input id="payment-amount" type="number" step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="payment-date">Paid on</Label>
            <Input id="payment-date" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="payment-note">Note</Label>
            <Input id="payment-note" value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} />
          </div>
          <Button type="button" onClick={onCreatePayment} disabled={isPending}>
            {isPending ? "Saving..." : "Record Payment"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

