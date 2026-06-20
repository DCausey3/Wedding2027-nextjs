# Wedding2027 — Next.js + Supabase

Jhoana & Damariel's wedding website. Two celebrations, one love story.

- 🇨🇴 **Colombia** — Pereira, November 7, 2026
- 🇺🇸 **USA** — Miami, December 12, 2026

---

## Stack

| Layer | Tech |
|---|---|
| Framework | **Next.js 15** (App Router, RSC) |
| Database + Auth | **Supabase** (Postgres + Auth) |
| Styling | **Tailwind CSS v4** + custom wedding tokens |
| Deployment | Vercel / AWS Amplify Hosting |
| UI | Radix UI, Lucide icons, Sonner toasts |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/DCausey3/Wedding2027.git
cd Wedding2027
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `schema/wedding.sql` — this creates all tables, enums, RLS policies, and the `get_dashboard_stats()` function
3. Copy your project credentials from **Project Settings > API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and service role key
```

### 4. Create admin users

After running the schema:

```sql
-- In Supabase SQL Editor, after inviting a user via the Auth dashboard:
insert into public.user_roles (user_id, role)
values ('<paste-user-uuid-here>', 'bride');

-- Repeat for groom:
insert into public.user_roles (user_id, role)
values ('<paste-user-uuid-here>', 'groom');
```

### 5. Run dev

```bash
npm run dev   # http://localhost:3000
```

---

## Project Structure

```
schema/
└── wedding.sql             ← Run this in Supabase SQL Editor

src/
├── app/
│   ├── (public)/           ← Public pages (home, events, travel, rsvp…)
│   ├── (admin)/            ← Auth-guarded admin dashboard
│   ├── admin/login/        ← Login page (outside auth group)
│   ├── api/
│   │   ├── rsvp/lookup/    ← GET: look up guest by invite code
│   │   ├── rsvp/submit/    ← POST: submit RSVP
│   │   └── auth/signout/   ← POST: server-side sign out
│   ├── globals.css         ← Tailwind v4 + wedding design tokens
│   └── layout.tsx          ← Root layout: SupabaseProvider + Toaster
│
├── components/
│   ├── admin/              ← AdminSidebar, DashboardStats, GuestTable, RecentGuests
│   ├── layout/             ← Navbar, Footer
│   ├── providers/
│   │   └── SupabaseProvider.tsx  ← Client auth context (useSupabase hook)
│   ├── rsvp/               ← RSVPFlow (multi-step, code → form → submit)
│   ├── ui/                 ← SectionHeader, CountdownTimer
│   └── wedding/            ← ContactForm, FAQAccordion, TravelTabs
│
├── lib/
│   ├── supabase.ts         ← createBrowserClient, createServerClient, createAdminClient
│   ├── database.types.ts   ← TypeScript types matching DB schema
│   ├── auth-utils.ts       ← getServerAuthUser (reads user_roles)
│   ├── data-client.ts      ← getGuestByInvitationCode, getAllGuests, upsertRSVP, getDashboardStats
│   └── utils.ts            ← cn(), formatDate(), getTimeLeft(), WEDDING_DATES
│
├── middleware.ts            ← Session refresh + /admin/* guard (Supabase SSR pattern)
└── types/index.ts           ← All app-layer types (camelCase)
```

---

## Auth Model

| Role | Access |
|---|---|
| `admin` | Full dashboard, guest management |
| `bride` / `groom` | Same as admin |
| `guest` | Public pages + RSVP (no login required) |
| Anonymous | Public pages + RSVP lookup/submit |

Auth is handled by **Supabase Auth** (email/password). Roles live in `public.user_roles`. The Next.js middleware reads the Supabase session cookie on every request and checks the role before allowing `/admin/*` routes.

---

## RSVP Flow

1. Guest visits `/rsvp`
2. Enters their **invitation code** → `GET /api/rsvp/lookup?code=XXX`
3. Fills in attendance, entrée, plus one, travel status
4. Submits → `POST /api/rsvp/submit` (uses service-role client, bypasses RLS)
5. Data lands in `rsvps`, `plus_ones`, `meal_preferences`, `travel_info`

---

## Regenerate TypeScript types

After changing the schema, regenerate `src/lib/database.types.ts`:

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  > src/lib/database.types.ts
```

---

## Env Vars Reference

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (bypasses RLS) |
| `NEXT_PUBLIC_WEDDING_COLOMBIA_DATE` | Browser | ISO datetime for countdown |
| `NEXT_PUBLIC_WEDDING_USA_DATE` | Browser | ISO datetime for countdown |
| `NEXT_PUBLIC_SITE_URL` | Server | For auth redirect URLs |
