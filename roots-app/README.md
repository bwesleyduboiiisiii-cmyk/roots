# ROOTS — Setup Guide

A family tree + polaroid photo album, built with Next.js, Supabase, and Vercel.
Where your family comes from, and what you remember.

## What you're getting

- `/login` — password-gated entry
- `/` — homepage with two big polaroid tiles linking to each section
- `/album` — photo album with polaroid styling, upload form with caption
- `/tree` — pan/zoom family tree with clickable nodes that open a bio modal

## 1. Set up Supabase (10 minutes)

1. Go to https://supabase.com and create a new project. Wait for it to provision (~2 min).
2. In your project, click **SQL Editor** in the sidebar.
3. Open `supabase/schema.sql` from this project, copy all of it, paste into the SQL editor, click **Run**.
4. (Optional) Paste `supabase/seed.sql` the same way if you want a sample family to see the tree working. You can delete those rows later.
5. Go to **Settings → API**. Copy two values:
   - Project URL (e.g. `https://abcdefg.supabase.co`)
   - `anon public` key (a long string)

## 2. Set up this project locally

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
FAMILY_PASSWORD=<pick something your family can remember>
AUTH_SECRET=<run: openssl rand -base64 32>
```

Run locally:

```bash
npm run dev
```

Open http://localhost:3000 and enter your family password.

## 3. Deploy to Vercel (5 minutes)

1. Push this project to GitHub (new repo).
2. Go to https://vercel.com and click **Add New → Project**.
3. Import your GitHub repo.
4. In **Environment Variables**, paste the same four values from your `.env.local`.
5. Click **Deploy**. About 90 seconds later you'll have a live URL.
6. In Vercel project settings, add a custom domain if you have one.

After this, every `git push` to GitHub redeploys automatically.

## 4. Adding real family members

There's no admin UI yet (see "Known gaps" below). For now, add people directly in Supabase:

1. Go to **Table Editor → people** in Supabase
2. Click **Insert row** for each person
3. Key fields:
   - `generation`: 0 = you, -1 = your parents, -2 = your grandparents, 1 = your kids
   - `sort_order`: left-to-right position within a generation (1, 2, 3...)
4. Then **Table Editor → relationships** to connect them
   - For spouses: insert two rows (both directions)
   - For parent → child: insert one row per parent

## Known gaps

See `GAPS.md`.
