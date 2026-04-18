export type TransactionType = "income" | "expense";
export type RecurringType = "none" | "daily" | "weekly" | "monthly";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  note: string | null;
  date: string;
  is_recurring: boolean;
  recurring_type: RecurringType;
  created_at: string;
  category?: Category | null;
  tags?: string[];
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
  month: string;
  created_at: string;
  spent?: number;
  category?: Category | null;
};

export type BudgetTemplate = {
  id: string;
  user_id: string;
  name: string;
  month: string;
  created_at: string;
};

export type TemplateItem = {
  id: string;
  template_id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  is_purchased: boolean;
  purchased_at: string | null;
  purchased_transaction_id: string | null;
  created_at: string;
  category?: Category | null;
};

export type GroceryCatalogItem = {
  id: string;
  group_name_bn: string;
  group_name_en: string;
  item_name_bn: string;
  item_name_en: string | null;
  default_unit: string;
  sort_order: number;
  created_at: string;
};

export type LoanStatus = "active" | "closed" | "defaulted";

export type Loan = {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  interest_rate: number;
  monthly_installment: number;
  start_date: string;
  due_day: number | null;
  status: LoanStatus;
  created_at: string;
  paid_amount?: number;
  remaining_amount?: number;
};

export type LoanPayment = {
  id: string;
  loan_id: string;
  user_id: string;
  amount: number;
  paid_on: string;
  note: string | null;
  created_at: string;
};

export type DashboardStats = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  planSummary: {
    planned: number;
    spent: number;
    previousSpent: number;
    completion: number;
    purchasedCount: number;
    itemCount: number;
  };
  loanSummary: {
    activeLoans: number;
    totalPayable: number;
    totalPaid: number;
    totalRemaining: number;
    monthlyDue: number;
    currentMonthPaid: number;
    previousMonthPaid: number;
  };
  recentTransactions: Transaction[];
  categoryBreakdown: Array<{ name: string; value: number; color: string }>;
  trend: Array<{ month: string; income: number; expense: number }>;
};

