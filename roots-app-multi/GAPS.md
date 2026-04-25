# Gaps & Recommendations

Read this before you ship to your family.

## Must-fix before sharing with family

### 1. No admin UI for the tree
Adding people means going into Supabase's table editor, which is fine for you but not for anyone else. If you want Grandma to add her siblings, you need a `/tree/edit` page with a form. Roughly 2-3 hours of work — one CRUD form for people, one for relationships.

### 2. No image compression
Right now a 10MB iPhone photo uploads as a 10MB file and gets served as 10MB. After 50 photos your Supabase free tier storage is gone. Add `browser-image-compression` (npm package) before the upload call in `PhotoUploader.tsx`. One line of code. Compress to ~1500px max dimension, ~80% quality.

### 3. No delete/edit for photos
If someone uploads a bad photo or typos a caption, there's no way to fix it without going into the database. Add a long-press/right-click menu on polaroids with "edit caption" and "delete" options.

### 4. HEIC photos from iPhones won't display
iPhones shoot in `.heic` by default. Browsers can't render HEIC. Either: (a) tell family members "iPhone users: Settings → Camera → Formats → Most Compatible", or (b) add `heic2any` to convert on upload. Option (b) is friendlier.

## Security considerations you should know

### The password gate is weak on purpose
- Anyone who knows the password gets full access (read + write + delete).
- The anon Supabase key is exposed in the browser (this is normal, but it means someone who inspects your site's JS can hit the database directly without the password).
- RLS policies currently allow any anon request — the security is only at the app's middleware layer.

For a family site, this is usually fine. If you want stronger security:
- Switch to Supabase Auth with magic links (each family member gets a login link by email)
- Tighten RLS to require `auth.uid() is not null`
- This also lets you track who uploaded what photo

That's maybe a half-day refactor. Worth it if the content is sensitive.

### No rate limiting
A malicious actor with the password could upload 10,000 photos and blow your storage quota. Vercel has some basic DDoS protection but not for authenticated uploads. Low risk for a family site.

## Family tree edge cases I didn't handle

The tree layout works for a "classic" family structure but will look awkward with:

- **Divorces and remarriages** — the data model handles it (multiple spouse relationships), but the visual layout will put both spouses side-by-side which looks weird. You'd want something like dashed lines for divorced-from, solid for current.
- **Half-siblings / step-families** — same issue. The data supports it; the layout doesn't make it visually clear.
- **Very wide generations (10+ siblings)** — horizontal scrolling works, but the crossing lines get messy. A proper solution uses a library like [family-chart](https://github.com/donatso/family-chart) or [relatives-tree](https://github.com/SanichKotikov/react-family-tree). I considered using one of these but picked the custom approach for simplicity. If your family is structurally complex, swap in `react-family-tree`.
- **"Which branch am I on"** — no visual cue for your family line vs. in-laws. Consider coloring by last name or maternal/paternal.

## Features I'd add in order of value

1. **Photo-to-person tagging in the UI** — right now `photos.tagged_people` exists in the schema but there's no UI to set it. Clicking a person in the tree should filter the album to their photos. That query is already set up (`/album?person=X`) but the filter isn't wired in the album page.
2. **Stories, not just captions** — some photos deserve a paragraph, not a one-liner. Add an optional "story" field that shows on click.
3. **Video support** — Supabase Storage handles video fine, you'd just need a `<video>` tag branch in `Polaroid.tsx` based on mime type.
4. **Reactions / hearts** — lightweight, joy-adding. A single `likes` counter per photo, no login required.
5. **Downloadable yearbook** — generate a PDF of the album once a year. The family will love this.

## Performance notes

- The album loads every photo at once. Past ~200 photos you want pagination or infinite scroll.
- The tree renders all people into the DOM even when zoomed out. Past ~100 people you want virtualization.
- Next.js `Image` with `unoptimized` is set because Vercel image optimization has a free-tier limit. Remove `unoptimized` if you upgrade to Vercel Pro for better performance.

## Cost estimate

On free tiers, you get:
- **Vercel Hobby**: free forever for personal projects
- **Supabase free**: 500MB database, 1GB storage, 2GB bandwidth/month
- **GitHub**: free

Realistic ceiling on free tier: ~500 compressed photos, ~20 daily visitors. Beyond that, Supabase Pro is $25/month.

## Quick wins I'd do this weekend

In priority order, if you have 4-6 hours:

1. Add `browser-image-compression` (15 min) — biggest bang for buck
2. Add HEIC conversion (30 min) — prevents silent iPhone upload failures
3. Add delete button on polaroids (45 min) — quality-of-life
4. Wire up `?person=X` filter on album (30 min) — connects the two halves
5. Add an "add person" form on the tree page (2 hours) — unblocks non-technical family members
6. Magic-link auth instead of shared password (3 hours) — real security
