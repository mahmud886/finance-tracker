export const APP_NAME = "Finance Tracker";

export const CURRENCIES = ["USD", "BDT", "EUR", "GBP", "INR"] as const;

export const DEFAULT_CATEGORIES = [
  { name: "Salary", icon: "wallet", color: "#22c55e", type: "income" },
  { name: "Freelance", icon: "briefcase", color: "#16a34a", type: "income" },
  { name: "Food", icon: "utensils", color: "#f97316", type: "expense" },
  { name: "Rent", icon: "house", color: "#ef4444", type: "expense" },
  { name: "Transport", icon: "car", color: "#3b82f6", type: "expense" },
  { name: "Utilities", icon: "bolt", color: "#6366f1", type: "expense" },
] as const;

export const RECURRING_TYPES = ["none", "daily", "weekly", "monthly"] as const;

