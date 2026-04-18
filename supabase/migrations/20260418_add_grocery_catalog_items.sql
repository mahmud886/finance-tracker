create extension if not exists "pgcrypto";

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

create index if not exists idx_grocery_catalog_group_sort on public.grocery_catalog_items(group_name_bn, sort_order);

alter table public.grocery_catalog_items enable row level security;

drop policy if exists "Anyone can read grocery catalog" on public.grocery_catalog_items;
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

