-- =============================================
-- ROOTS MULTI-FAMILY MIGRATION
-- Run this AFTER the original schema.sql
-- This converts ROOTS from single-family to multi-family
-- =============================================

-- Enable pgcrypto for password hashing (used by registration API)
create extension if not exists pgcrypto;

-- ===========================================
-- 1. FAMILIES TABLE
-- ===========================================
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,         -- url-safe: 'dubois', 'smith-family'
  password_hash text not null,       -- bcrypt hash, never plain text
  created_by_name text,              -- e.g. "Benjamin DuBois"
  created_at timestamptz default now(),
  -- Constraints
  constraint slug_format check (slug ~ '^[a-z0-9-]{2,40}$'),
  constraint name_length check (char_length(name) between 2 and 80)
);

create index if not exists families_slug_idx on families (slug);

-- ===========================================
-- 2. ADD family_id TO EXISTING TABLES
-- ===========================================

-- People
alter table people add column if not exists family_id uuid references families(id) on delete cascade;
create index if not exists people_family_id_idx on people (family_id);

-- Relationships
alter table relationships add column if not exists family_id uuid references families(id) on delete cascade;
create index if not exists relationships_family_id_idx on relationships (family_id);

-- Photos
alter table photos add column if not exists family_id uuid references families(id) on delete cascade;
create index if not exists photos_family_id_idx on photos (family_id);

-- ===========================================
-- 3. UPDATE RLS POLICIES
-- App layer enforces family isolation via auth cookie.
-- These policies stay open at DB layer; security is in the API routes.
-- ===========================================

drop policy if exists "Anyone can read people" on people;
drop policy if exists "Anyone can insert people" on people;
drop policy if exists "Anyone can update people" on people;
drop policy if exists "Anyone can read relationships" on relationships;
drop policy if exists "Anyone can insert relationships" on relationships;
drop policy if exists "Anyone can read photos" on photos;
drop policy if exists "Anyone can insert photos" on photos;
drop policy if exists "Anyone can update photos" on photos;

-- Re-create — same permissions, but now the app must always provide family_id
create policy "Read all people" on people for select using (true);
create policy "Insert people" on people for insert with check (family_id is not null);
create policy "Update people" on people for update using (true);

create policy "Read all relationships" on relationships for select using (true);
create policy "Insert relationships" on relationships for insert with check (family_id is not null);

create policy "Read all photos" on photos for select using (true);
create policy "Insert photos" on photos for insert with check (family_id is not null);
create policy "Update photos" on photos for update using (true);

-- Families table policies
alter table families enable row level security;
create policy "Anyone can read family by slug" on families for select using (true);
create policy "Anyone can register a family" on families for insert with check (true);

-- ===========================================
-- 4. STORAGE — partition photos by family in path
-- Files will be stored as: family-photos/{family_id}/{filename}
-- ===========================================
-- Existing bucket policy already allows public read/write, which is fine.
-- App layer enforces correct family_id in upload paths.

-- ===========================================
-- 5. HELPER FUNCTION: hash a password (used by /api/register)
-- ===========================================
create or replace function hash_password(password text) returns text as $$
  select crypt(password, gen_salt('bf', 10));
$$ language sql immutable;

create or replace function verify_password(password text, hash text) returns boolean as $$
  select crypt(password, hash) = hash;
$$ language sql immutable;

-- ===========================================
-- IMPORTANT: existing data
-- If you have existing people/photos from single-family mode,
-- they have NULL family_id. Either:
-- (a) Delete them: truncate people, relationships, photos cascade;
-- (b) Assign them to a family after creating one — UPDATE statements below.
-- ===========================================

-- Example to migrate existing data to a new family (uncomment and adjust):
-- insert into families (name, slug, password_hash, created_by_name)
--   values ('The Smith Family', 'smith', hash_password('changeme'), 'Admin');
-- update people set family_id = (select id from families where slug = 'smith') where family_id is null;
-- update relationships set family_id = (select id from families where slug = 'smith') where family_id is null;
-- update photos set family_id = (select id from families where slug = 'smith') where family_id is null;
