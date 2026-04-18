export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: "income" | "expense";
          category_id: string;
          note: string | null;
          date: string;
          is_recurring: boolean;
          recurring_type: "none" | "daily" | "weekly" | "monthly";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: "income" | "expense";
          category_id: string;
          note?: string | null;
          date: string;
          is_recurring?: boolean;
          recurring_type?: "none" | "daily" | "weekly" | "monthly";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: "income" | "expense";
          category_id?: string;
          note?: string | null;
          date?: string;
          is_recurring?: boolean;
          recurring_type?: "none" | "daily" | "weekly" | "monthly";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          limit_amount: number;
          month: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          limit_amount: number;
          month: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          limit_amount?: number;
          month?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      budget_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          month: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          month: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          month?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_templates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      template_items: {
        Row: {
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
        };
        Insert: {
          id?: string;
          template_id: string;
          user_id: string;
          category_id?: string | null;
          name: string;
          quantity?: number;
          unit?: string;
          estimated_price: number;
          is_purchased?: boolean;
          purchased_at?: string | null;
          purchased_transaction_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          user_id?: string;
          category_id?: string | null;
          name?: string;
          quantity?: number;
          unit?: string;
          estimated_price?: number;
          is_purchased?: boolean;
          purchased_at?: string | null;
          purchased_transaction_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_items_purchased_transaction_id_fkey";
            columns: ["purchased_transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_items_template_user_fk";
            columns: ["template_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "budget_templates";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          total_amount: number;
          interest_rate: number;
          monthly_installment: number;
          start_date: string;
          due_day: number | null;
          status: "active" | "closed" | "defaulted";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          total_amount: number;
          interest_rate?: number;
          monthly_installment: number;
          start_date?: string;
          due_day?: number | null;
          status?: "active" | "closed" | "defaulted";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          total_amount?: number;
          interest_rate?: number;
          monthly_installment?: number;
          start_date?: string;
          due_day?: number | null;
          status?: "active" | "closed" | "defaulted";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      loan_payments: {
        Row: {
          id: string;
          loan_id: string;
          user_id: string;
          amount: number;
          paid_on: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          user_id: string;
          amount: number;
          paid_on?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          loan_id?: string;
          user_id?: string;
          amount?: number;
          paid_on?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_user_fk";
            columns: ["loan_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      grocery_catalog_items: {
        Row: {
          id: string;
          group_name_bn: string;
          group_name_en: string;
          item_name_bn: string;
          item_name_en: string | null;
          default_unit: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_name_bn: string;
          group_name_en: string;
          item_name_bn: string;
          item_name_en?: string | null;
          default_unit?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_name_bn?: string;
          group_name_en?: string;
          item_name_bn?: string;
          item_name_en?: string | null;
          default_unit?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction_tags: {
        Row: {
          transaction_id: string;
          tag_id: string;
        };
        Insert: {
          transaction_id: string;
          tag_id: string;
        };
        Update: {
          transaction_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
