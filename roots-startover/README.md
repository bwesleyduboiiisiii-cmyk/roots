# ROOTS

A private family website with a shared-password gate, an interactive family tree, and a polaroid photo album.

## Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase Postgres + Storage
- Vercel deployment via GitHub

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
FAMILY_PASSWORD=your-family-password
AUTH_SECRET=a-long-random-secret-at-least-32-characters
```

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Optional: run `supabase/seed.sql`.

## GitHub + Vercel setup

1. Push this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add the same four env vars in Vercel Project Settings.
4. Redeploy after env var changes.

## Landing image

The final cinematic landing page image is already included here:

```text
public/landing-final.png
```

Next.js serves it from:

```text
/landing-final.png
```

## Current limitations

- Shared password auth, not per-user accounts.
- Family member editing is currently done through Supabase table editor.
- The family tree uses generation and sort order for layout.
- The landing page uses a real image asset because realistic tree art is better as artwork than SVG code.
