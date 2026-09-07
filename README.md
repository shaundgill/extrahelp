# Extra help tracker

Tracks days your hospitalist group sends extra AP or physician coverage beyond
the baseline staffing model (5 rounding docs, 1 admitting doc, 2 core APs),
so you have real data for whether a 6th physician should be permanent.

Tracking starts 2026-07-01. It's a public link, no login — anyone with the
URL can view and log entries. Nothing here is patient data, so there's no
PHI/HIPAA scope to manage.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the SQL editor, run everything in `supabase/schema.sql`.
3. In Project settings → API, copy the **Project URL** and **anon public key**.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in `.env` with the Project URL and anon key from step 1.

## 3. Run it locally

```bash
npm install
npm run dev
```

## 4. Deploy so it's reachable remotely

The easiest path is Vercel:

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo.
3. Under Environment Variables, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` with the same values as your `.env`.
4. Deploy. Vercel gives you a URL (e.g. `extra-help-tracker.vercel.app`) that
   anyone with the link can open from any device — no login screen.

Since it's public and writable by anyone with the link, don't post the URL
somewhere fully open — sharing it directly with your lead physician (and
anyone else who should log days) keeps it effectively private without the
overhead of accounts.

## Logging historical days

There's no bulk import yet — enter past days one at a time from the "Log a
day" form (the date picker allows any date from 2026-07-01 onward). If you
want a CSV import for backfilling July onward faster, that's a
straightforward follow-up addition.

## Data model

One row per day in `extra_help_entries`:

- `entry_date` — unique, the day being logged
- `census` — optional total census that day
- `extras` — array of `{ type: "AP" | "Doc", name: string }`, one entry per
  extra person sent that day

Saving the same date twice overwrites that day, so corrections are just
re-entering the date.
