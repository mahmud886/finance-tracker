-- Seed data for Supabase SQL Editor
-- Optional: set v_user_id to a real UUID if you want a specific user.

do $$
declare
  v_user_id uuid := null;
  v_email text;
  v_name text;
begin
  if v_user_id is null then
    select id into v_user_id
    from public.users
    order by created_at desc
    limit 1;
  end if;

  -- Fallback: if profile table is empty, try to bootstrap from auth.users.
  if v_user_id is null then
    select
      au.id,
      au.email,
      coalesce(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1))
    into v_user_id, v_email, v_name
    from auth.users au
    order by au.created_at desc
    limit 1;

    if v_user_id is not null then
      insert into public.users (id, email, name)
      values (v_user_id, v_email, v_name)
      on conflict (id) do nothing;
    end if;
  end if;

  if v_user_id is null then
    raise exception 'No users found in public.users or auth.users. Create a user first (app sign-up or Supabase Auth -> Users), then run this script.';
  end if;

  insert into public.categories (user_id, name, icon, color)
  select v_user_id, seed.name, seed.icon, seed.color
  from (
    values
      ('Salary', 'wallet', '#22c55e'),
      ('Food', 'utensils', '#f97316'),
      ('Rent', 'house', '#ef4444'),
      ('Transport', 'car', '#3b82f6')
  ) as seed(name, icon, color)
  where not exists (
    select 1
    from public.categories c
    where c.user_id = v_user_id
      and c.name = seed.name
  );

  with selected as (
    select id, name
    from public.categories
    where user_id = v_user_id
  ),
  tx_seed as (
    select v_user_id as user_id, 4500::numeric as amount, 'income'::text as type, 'Salary'::text as category_name, 'Monthly salary'::text as note, (current_date - 15) as date, true as is_recurring, 'monthly'::text as recurring_type
    union all
    select v_user_id, 120::numeric, 'expense', 'Food', 'Groceries', current_date - 2, false, 'none'
    union all
    select v_user_id, 900::numeric, 'expense', 'Rent', 'Apartment rent', current_date - 5, true, 'monthly'
    union all
    select v_user_id, 40::numeric, 'expense', 'Transport', 'Ride share', current_date - 1, false, 'none'
  )
  insert into public.transactions (
    user_id,
    amount,
    type,
    category_id,
    note,
    date,
    is_recurring,
    recurring_type
  )
  select
    t.user_id,
    t.amount,
    t.type,
    c.id,
    t.note,
    t.date,
    t.is_recurring,
    t.recurring_type
  from tx_seed t
  join selected c on c.name = t.category_name
  where not exists (
    select 1
    from public.transactions x
    where x.user_id = t.user_id
      and x.category_id = c.id
      and x.amount = t.amount
      and x.type = t.type
      and x.date = t.date
      and coalesce(x.note, '') = coalesce(t.note, '')
  );
end
$$;
