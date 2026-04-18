"use client";

import { Menu, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";

export function Topbar({ title }: { title: string }) {
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const theme = useUIStore((state) => state.theme);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-card/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="md:hidden" onClick={() => setMobileSidebarOpen(true)}>
          <Menu size={16} />
        </Button>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        <span className="hidden sm:inline">Theme</span>
      </Button>
    </header>
  );
}

