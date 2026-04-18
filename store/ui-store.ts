"use client";

import { create } from "zustand";

type ThemeMode = "light" | "dark";

type UIState = {
  theme: ThemeMode;
  isMobileSidebarOpen: boolean;
  isPlanDialogOpen: boolean;
  isLoanDialogOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setPlanDialogOpen: (open: boolean) => void;
  setLoanDialogOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: "light",
  isMobileSidebarOpen: false,
  isPlanDialogOpen: false,
  isLoanDialogOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  setPlanDialogOpen: (open) => set({ isPlanDialogOpen: open }),
  setLoanDialogOpen: (open) => set({ isLoanDialogOpen: open }),
}));

