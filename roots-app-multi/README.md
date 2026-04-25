# ROOTS — Multi-Family Edition

A platform where families can each have their own private space for their tree and photo album. Built with Next.js, Supabase, and Vercel.

## What this is

ROOTS is now a multi-tenant platform. Each family registers with a unique name and password, and they get their own isolated:
- Family tree (people + relationships)
- Photo album (with their photos namespaced in storage)
- URL: `your-domain.com/their-family-slug/tree`

Anyone with your URL can register a new family.

## Architecture overview

- `/` — public landing page; sign in or register
- `/[slug]/hub` — family's home dashboard (auth required, scoped to their family)
- `/[slug]/tree` — that family's tree (only their data)
- `/[slug]/album` — that family's album (only their photos)
- `/api/login` — POST sign in, DELETE sign out
- `/api/register` — POST to create a new family

Auth is a signed cookie (HMAC-SHA256) containing `{family_id, family_slug, family_name}`. Server reads it on every request and scopes all queries by `family_id`.

## Setup — fresh project

### 1. Run the schema in Supabase

If starting fresh, in Supabase SQL Editor run **both files in order**:
1. `supabase/schema.sql` (original single-family base schema)
2. `supabase/migration-multi-family.sql` (adds families table + family_id columns)

### 2. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
AUTH_SECRET=long-random-string-32-plus-chars
```

`FAMILY_PASSWORD` is no longer used — delete it from Vercel if it's there.

### 3. Deploy

Push to GitHub. Vercel auto-deploys.

## Setup — upgrading from single-family

If you already had ROOTS running single-family:

1. **Run only the migration** (`supabase/migration-multi-family.sql`) in Supabase SQL Editor. The original schema is already in place.

2. **Decide what to do with existing data.** Existing rows have `family_id = NULL` and won't appear anywhere until assigned.

   Option A — wipe and start fresh:
   ```sql
   truncate people, relationships, photos cascade;
   ```

   Option B — preserve existing data:
   - Register your family through the new UI first
   - Then in Supabase SQL editor, replace `your-slug` with your actual family slug:
   ```sql
   update people set family_id = (select id from families where slug = 'your-slug') where family_id is null;
   update relationships set family_id = (select id from families where slug = 'your-slug') where family_id is null;
   update photos set family_id = (select id from families where slug = 'your-slug') where family_id is null;
   ```

3. **Remove `FAMILY_PASSWORD`** from Vercel environment variables.

4. **Push the new code** and let Vercel redeploy.

## Testing

1. Open your site
2. Click "ENTER OUR FAMILY"
3. Switch to "New family" tab
4. Fill in: family name, your name, password (6+ chars), confirm
5. Click "PLANT THE SEED"
6. You should land on `/your-family-slug/hub`

Slug = lowercase, alphanumeric+hyphens, derived from family name. "The DuBois Family" → `the-dubois-family`.

## ⚠️ Security status (read before going public)

This is **Phase 1** of the multi-family build. Phase 2 (security hardening) is not yet done.

**Do NOT publicize your URL until Phase 2 ships**, because:

- ❌ No rate limiting on registration — bot could create 10,000 fake families
- ❌ No CAPTCHA
- ❌ No email verification — no account recovery if password lost
- ❌ No storage quotas per family — one family could exhaust your Supabase storage

**What IS in place:**

- ✅ Passwords hashed with bcrypt (pgcrypto extension)
- ✅ Sessions are HMAC-signed cookies (can't be forged without `AUTH_SECRET`)
- ✅ All queries scoped by `family_id` server-side
- ✅ Photo storage namespaced by family ID in storage path
- ✅ Family slug uniqueness enforced at the database level
- ✅ Password length minimum (6 chars) and family name validation

Use it privately, share with trusted families only, until Phase 2 lands.
