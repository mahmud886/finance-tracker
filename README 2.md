# Finance Tracker

Personal finance management app built with Next.js App Router and Supabase. It supports daily transaction tracking, monthly budgets, grocery planning, loan repayment tracking, and exportable reports.

## Tech Stack

- Next.js `16.2.4` (App Router, Server Components, Server Actions)
- React `19.2.4`, TypeScript `5`
- Tailwind CSS `4`
- Supabase (Auth + PostgreSQL + Realtime)
- Zustand (client state), Zod + React Hook Form (form validation)
- Recharts (charts), Sonner (toasts), GSAP (motion)
- PapaParse + jsPDF (CSV/PDF reporting)

## What the App Does

- Auth: sign up, log in, forgot password, reset password
- Dashboard: balances, trends, category distribution, plan and loan health signals
- Transactions: create/delete entries, recurring metadata, realtime refresh support
- Budgets: monthly category limits and spending progress
- Categories: color/icon based classification
- Plans: monthly grocery planning with reusable catalog and checklist
- Loans: loan accounts, EMI tracking, and payment history
- Reports: filter transactions and export CSV/PDF
- Settings: profile details, currency, and preferences

## Public Landing Experience

- Root route `/` now serves a polished marketing-style landing page for signed-out users.
- Authenticated users are redirected from `/` to `/dashboard`.
- Landing page includes hero messaging, feature cards, trust/social-proof blocks, and clear login/signup CTAs.
- Section-level reveal animations are applied using `components/animated/animated-section.tsx`.

## Social Preview Metadata

- Global metadata is configured in `app/layout.tsx`.
- Open Graph and Twitter preview fields are set for richer link sharing.
- Preview image uses `public/og-image.svg`.
- `metadataBase` uses `NEXT_PUBLIC_SITE_URL` with a localhost fallback.

## Pagination Coverage

Shared pagination controls are used across long data views to keep UI behavior consistent:

- `components/transactions/transaction-table.tsx`
- `components/loans/loans-workspace.tsx` (Loans + Payment History)
- `components/plans/plan-items-table.tsx`
- `components/plans/plan-sidebar.tsx` (Catalog list)
- `components/budgets/budget-list.tsx`
- `components/dashboard/recent-transactions.tsx`

Shared component:

- `components/ui/pagination-controls.tsx`

## App Routes

### Public/Auth

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

### Protected Dashboard Area

- `/dashboard`
- `/transactions`
- `/budgets`
- `/categories`
- `/plans`
- `/loans`
- `/reports`
- `/settings`

Route protection is enforced in `proxy.ts` using Supabase session checks.

## Repository Structure

- `app/`
  - Route tree (auth + dashboard pages, loading and error boundaries)
- `components/`
  - `ui/`: design system primitives
  - `forms/`: form-driven mutations
  - feature folders (`transactions`, `budgets`, `plans`, `loans`, `dashboard`, `reports`)
- `lib/`
  - `actions/`: Server Actions for data writes and aggregate queries
  - `data.ts`: server-side data loaders
  - `supabase/`: server/client/proxy Supabase clients
  - `validations/`: Zod schemas
- `store/`
  - Zustand stores for client interaction state
- `supabase/`
  - `schema.sql`: schema, policies, triggers, seed catalog insert
  - `sample-data.sql`: optional sample rows
- `types/`
  - app and database types

## Data Model (High Level)

Main tables from `supabase/schema.sql`:

- `users`
- `categories`
- `transactions`
- `budgets`
- `tags`
- `transaction_tags`
- `grocery_catalog_items`

Security model:

- Row Level Security enabled on app tables
- Per-user ownership policies for private financial data
- Public read policy for grocery catalog items
- Trigger `handle_new_user` auto-creates profile + starter categories on signup

Recurring helper:

- SQL function `materialize_recurring_transactions(p_user_id uuid)` exists for scheduled recurring entries.

## Environment Variables

Use `.env.example` as reference:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`lib/supabase/env.ts` accepts publishable key first, then anon key fallback.

## Local Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. (Optional) run `supabase/sample-data.sql` after replacing sample user IDs.
4. Copy env file and set keys.

```bash
cp .env.example .env.local
```

## Run the App

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Key Runtime Flows

- Mutations happen through Server Actions in `lib/actions/*`.
- UI refresh after writes is typically done via `router.refresh()`.
- Transaction table subscribes to Supabase realtime changes for live updates.
- Client stores (`store/*`) hold selected entities and dialog state for richer UX.

## Deployment Notes

- Deploy to any Node-compatible platform supporting Next.js App Router.
- Configure all `NEXT_PUBLIC_*` variables in your deployment environment.
- Ensure Supabase Auth redirect URLs include production + preview domains.

## Troubleshooting

- **Missing Supabase env error**: confirm `NEXT_PUBLIC_SUPABASE_URL` and at least one key (`PUBLISHABLE_KEY` or `ANON_KEY`).
- **Protected route redirects to login**: verify active session cookie and Supabase project URL/key pairing.
- **No data visible after signup**: check RLS policies and trigger execution in `supabase/schema.sql`.
