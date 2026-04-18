"use client";

import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-label="Close sheet" />
      <aside className={cn("absolute left-0 top-0 h-full w-72 border-r border-border/80 bg-card/98 p-4 shadow-[var(--shadow-md)] animate-in slide-in-from-left duration-200")}>
        {children}
      </aside>
    </div>
  );
}

