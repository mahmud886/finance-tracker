-- Finance Tracker schema for Supabase PostgreSQL
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  avatar_url text,
  currency text not null default 'USD',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  icon text not null default 'tag',
  color text not null default '#3b82f6',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid not null references public.categories(id) on delete restrict,
  note text,
  date date not null,
  is_recurring boolean not null default false,
  recurring_type text not null default 'none' check (recurring_type in ('none', 'daily', 'weekly', 'monthly')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  limit_amount numeric(14,2) not null check (limit_amount > 0),
  month text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, category_id, month)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

create table if not exists public.transaction_tags (
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (transaction_id, tag_id)
);

create table if not exists public.grocery_catalog_items (
  id uuid primary key default gen_random_uuid(),
  group_name_bn text not null,
  group_name_en text not null,
  item_name_bn text not null,
  item_name_en text,
  default_unit text not null default 'pcs',
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (group_name_bn, item_name_bn)
);

create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_grocery_catalog_group_sort on public.grocery_catalog_items(group_name_bn, sort_order);

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.tags enable row level security;
alter table public.transaction_tags enable row level security;
alter table public.grocery_catalog_items enable row level security;

create policy "Users can select own profile" on public.users for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

create policy "Users manage own categories" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own budgets" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own tags" on public.tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own transaction tags" on public.transaction_tags for all
using (
  exists (
    select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid()
  )
);

create policy "Anyone can read grocery catalog" on public.grocery_catalog_items for select using (true);

insert into public.grocery_catalog_items (
  group_name_bn,
  group_name_en,
  item_name_bn,
  item_name_en,
  default_unit,
  sort_order
)
values
  ('শস্য ও তেল', 'Grains & Oils', 'চাল (নাজিরশাইল/মিনিকেট)', 'Rice', 'kg', 10),
  ('শস্য ও তেল', 'Grains & Oils', 'আটা (লাল আটা)', 'Wheat flour', 'kg', 20),
  ('শস্য ও তেল', 'Grains & Oils', 'সয়াবিন তেল', 'Soybean oil', 'liter', 30),
  ('শস্য ও তেল', 'Grains & Oils', 'সরিষার তেল', 'Mustard oil', 'liter', 40),
  ('শস্য ও তেল', 'Grains & Oils', 'মসুর ডাল (দেশি)', 'Red lentil', 'kg', 50),
  ('শস্য ও তেল', 'Grains & Oils', 'মুগ/ছোলার ডাল', 'Mung/Chickpea lentil', 'kg', 60),
  ('শস্য ও তেল', 'Grains & Oils', 'চিনি', 'Sugar', 'kg', 70),
  ('শস্য ও তেল', 'Grains & Oils', 'লবণ', 'Salt', 'kg', 80),
  ('প্রোটিন ও ডেইরি', 'Protein & Dairy', 'তরল দুধ', 'Liquid milk', 'liter', 90),
  ('প্রোটিন ও ডেইরি', 'Protein & Dairy', 'ডিম', 'Egg', 'pcs', 100),
  ('প্রোটিন ও ডেইরি', 'Protein & Dairy', 'মুরগি', 'Chicken', 'kg', 110),
  ('প্রোটিন ও ডেইরি', 'Protein & Dairy', 'মাছ', 'Fish', 'kg', 120),
  ('প্রোটিন ও ডেইরি', 'Protein & Dairy', 'ঘি (বাচ্চার জন্য)', 'Ghee (for baby)', 'jar', 130),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'পেঁয়াজ', 'Onion', 'kg', 140),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'রসুন', 'Garlic', 'kg', 150),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'আদা', 'Ginger', 'kg', 160),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'এলাচ', 'Cardamom', 'g', 170),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'দারুচিনি', 'Cinnamon', 'g', 180),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'তেজপাতা', 'Bay leaf', 'g', 190),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'হলুদ গুঁড়া', 'Turmeric powder', 'g', 200),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'মরিচ গুঁড়া', 'Chili powder', 'g', 210),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'জিরা গুঁড়া', 'Cumin powder', 'g', 220),
  ('মসলা ও নিত্যপ্রয়োজনীয়', 'Spices & Basics', 'ধনিয়া গুঁড়া', 'Coriander powder', 'g', 230),
  ('সবজি ও ফল', 'Produce & Fruits', 'আলু', 'Potato', 'kg', 240),
  ('সবজি ও ফল', 'Produce & Fruits', 'বিভিন্ন সবজি (লাউ, পেঁপে, মিষ্টি কুমড়া ইত্যাদি)', 'Mixed vegetables', 'kg', 250),
  ('সবজি ও ফল', 'Produce & Fruits', 'কাঁচা মরিচ ও ধনেপাতা', 'Green chili & coriander', 'bundle', 260),
  ('সবজি ও ফল', 'Produce & Fruits', 'বাচ্চার ফল (আপেল/কলা)', 'Baby fruits', 'kg', 270),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'গোসলের সাবান', 'Bath soap', 'pcs', 280),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'ডিটারজেন্ট পাউডার', 'Detergent powder', 'kg', 290),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'টুথপেস্ট', 'Toothpaste', 'pcs', 300),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'ডিশ ক্লিনার', 'Dish cleaner', 'bottle', 310),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'শ্যাম্পু', 'Shampoo', 'bottle', 320),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'ফ্লোর ও টয়লেট ক্লিনার', 'Floor & toilet cleaner', 'bottle', 330),
  ('ক্লিনিং ও হাইজিন', 'Cleaning & Hygiene', 'বেবি সোপ ও লোশন', 'Baby soap & lotion', 'set', 340)
on conflict (group_name_bn, item_name_bn) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, icon, color)
  values
    (new.id, 'Salary', 'wallet', '#22c55e'),
    (new.id, 'Food', 'utensils', '#f97316'),
    (new.id, 'Rent', 'house', '#ef4444'),
    (new.id, 'Transport', 'car', '#3b82f6')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Recurring transactions materialization function (schedule with pg_cron if enabled)
create or replace function public.materialize_recurring_transactions(p_user_id uuid)
returns void
language plpgsql
as $$
declare
  tx record;
  next_date date;
begin
  for tx in
    select * from public.transactions
    where user_id = p_user_id and is_recurring = true and recurring_type <> 'none'
  loop
    next_date := tx.date;

    if tx.recurring_type = 'daily' then
      next_date := current_date;
    elsif tx.recurring_type = 'weekly' then
      next_date := date_trunc('week', current_date)::date;
    elsif tx.recurring_type = 'monthly' then
      next_date := date_trunc('month', current_date)::date;
    end if;

    if next_date > tx.date then
      insert into public.transactions (
        user_id, amount, type, category_id, note, date, is_recurring, recurring_type
      )
      values (
        tx.user_id, tx.amount, tx.type, tx.category_id, tx.note, next_date, tx.is_recurring, tx.recurring_type
      )
      on conflict do nothing;
    end if;
  end loop;
end;
$$;

