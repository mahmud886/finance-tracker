"use client";

import { Sheet } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useUIStore } from "@/store/ui-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 border-r border-border/80 bg-card/80 p-4 backdrop-blur-xl md:block">
        <Sidebar />
      </aside>
      <Sheet open={isMobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <Sidebar />
      </Sheet>
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">{children}</main>
    </div>
  );
}

