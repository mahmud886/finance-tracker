import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeDollarSign,
  BanknoteArrowDown,
  CalendarClock,
  ChartNoAxesCombined,
  CircleCheckBig,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

import { AnimatedSection } from "@/components/animated/animated-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const features = [
    {
      title: "Track transactions",
      description: "Capture daily income and expenses with recurring support and clean category history.",
      icon: BanknoteArrowDown,
    },
    {
      title: "Stay within budgets",
      description: "Set monthly category limits and monitor progress before overspending happens.",
      icon: PiggyBank,
    },
    {
      title: "Plan smarter",
      description: "Build monthly grocery checklists from a reusable catalog and track completion in real time.",
      icon: CalendarClock,
    },
    {
      title: "Monitor loans",
      description: "See repayment progress, monthly EMI pressure, and payment history in one place.",
      icon: BadgeDollarSign,
    },
    {
      title: "Visual dashboards",
      description: "Understand spending trends and category breakdowns through concise visual insights.",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Export reports",
      description: "Filter transaction data and export CSV or PDF reports whenever you need them.",
      icon: ShieldCheck,
    },
  ];

  const highlights = [
    "Secure auth with protected routes",
    "Realtime transaction updates",
    "Organized App Router workflow",
    "Made for daily personal use",
  ];

  const trustItems = [
    { name: "Personal budgeting", quote: "I finally see exactly where my monthly cash is going." },
    { name: "Family groceries", quote: "Planning and purchase tracking are now in one clean workflow." },
    { name: "Loan management", quote: "The EMI pressure snapshot helps me plan ahead each month." },
  ];

  const trustBadges = ["Secure Auth", "Supabase + RLS", "Realtime Updates", "CSV/PDF Exports"];

  return (
    <main className="min-h-screen bg-linear-to-b from-background via-background to-muted/35">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <AnimatedSection>
          <section className="relative overflow-hidden rounded-3xl border border-border/75 bg-card/85 p-6 shadow-(--shadow-md) md:p-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_45%)]" />
            <Badge className="bg-soft-accent text-soft-accent-foreground">Personal Finance OS</Badge>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              Take control of money with a calmer, clearer workflow in {APP_NAME}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
              Plan spending, track transactions, manage loans, and review reports with one clean dashboard built for day-to-day decisions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm shadow-emerald-900/25 transition-all duration-200 hover:-translate-y-px hover:bg-emerald-500"
              >
                Start free
                <ArrowRight size={16} className="ml-1.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card/85 px-4 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted/80"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <Badge key={item} className="gap-1.5 border border-border/75 bg-card/75 text-muted-foreground">
                  <CircleCheckBig size={12} />
                  {item}
                </Badge>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="mt-8 md:mt-10">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Everything in one place</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Built for practical money management</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-muted/45">
                      <Icon size={18} className="text-emerald-600" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="mt-8 rounded-2xl border border-border/75 bg-card/80 p-6 md:mt-10 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Trust and social proof</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">Built for real day-to-day finance decisions</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trustBadges.map((item) => (
                  <Badge key={item} className="border border-border/75 bg-muted/50 text-muted-foreground">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {trustItems.map((item) => (
                <div key={item.name} className="rounded-xl border border-border/75 bg-card p-4">
                  <p className="text-sm text-foreground">&ldquo;{item.quote}&rdquo;</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="mt-8 rounded-2xl border border-border/75 bg-card/80 p-6 md:mt-10 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ready to start?</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Create your account and get your finance dashboard today.</h3>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Start with categories and transactions, then gradually enable budgets, plans, and loans as your workflow grows.
            </p>
            <div className="mt-5">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm shadow-emerald-900/25 transition-all duration-200 hover:-translate-y-px hover:bg-emerald-500"
              >
                Create account
              </Link>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </main>
  );
}
