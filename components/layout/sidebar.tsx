"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ClipboardList, CreditCard, FolderTree, Landmark, LayoutDashboard, PiggyBank, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const coreNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/plans", label: "Plans", icon: ClipboardList },
  { href: "/loans", label: "Loans", icon: Landmark },
];

const insightsNavItems = [
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col gap-2">
      <div className="mb-3 rounded-xl border border-border/80 bg-muted/35 px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Personal Finance</p>
        <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">Finance Tracker</p>
      </div>
      <nav aria-label="Sidebar navigation" className="space-y-3">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Manage</p>
          {coreNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transform-none",
                  active
                    ? "border-emerald-500/55 bg-emerald-600 text-white shadow-sm shadow-emerald-900/20"
                    : "border-transparent text-muted-foreground hover:-translate-y-px hover:border-border/80 hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <span className={cn("absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-transparent", active ? "bg-white/80" : "")} />
                <Icon size={16} className="transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Insights</p>
          {insightsNavItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transform-none",
                  active
                    ? "border-emerald-500/55 bg-emerald-600 text-white shadow-sm shadow-emerald-900/20"
                    : "border-transparent text-muted-foreground hover:-translate-y-px hover:border-border/80 hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <span className={cn("absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-transparent", active ? "bg-white/80" : "")} />
                <Icon size={16} className="transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

