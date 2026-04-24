-- =============================================
-- FAMILY ALBUM SCHEMA
-- Paste this whole file into Supabase SQL Editor
-- =============================================

-- People (family members in the tree)
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  maiden_name text,
  nickname text,
  birth_date date,
  death_date date,
  bio text,
  profile_photo_url text,
  generation int not null default 0,  -- 0 = you, -1 = parents, -2 = grandparents, 1 = kids, etc.
  sort_order int default 0,           -- left-to-right ordering within a generation
  created_at timestamptz default now()
);

-- Relationships (flexible: handles divorces, remarriages, adoptions)
create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  related_person_id uuid not null references people(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('parent', 'spouse', 'sibling')),
  created_at timestamptz default now(),
  unique(person_id, related_person_id, relationship_type)
);

-- Photos (the polaroid album)
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  uploaded_by text,          -- free text, e.g. "Aunt Linda"
  taken_date date,            -- optional — shown in polaroid corner
  tagged_people uuid[] default '{}',
  rotation int default 0,     -- -3 to 3 degrees, for that scattered-polaroid look
  created_at timestamptz default now()
);

create index if not exists photos_created_at_idx on photos (created_at desc);
create index if not exists photos_tagged_people_idx on photos using gin (tagged_people);
create index if not exists people_generation_idx on people (generation, sort_order);

-- =============================================
-- STORAGE BUCKET for uploaded photos
-- =============================================
insert into storage.buckets (id, name, public)
values ('family-photos', 'family-photos', true)
on conflict (id) do nothing;

-- =============================================
-- ROW LEVEL SECURITY
-- With password-gate auth, we allow anon read/write.
-- Security lives at the app layer (the password cookie).
-- =============================================
alter table people enable row level security;
alter table relationships enable row level security;
alter table photos enable row level security;

create policy "Anyone can read people" on people for select using (true);
create policy "Anyone can insert people" on people for insert with check (true);
create policy "Anyone can update people" on people for update using (true);

create policy "Anyone can read relationships" on relationships for select using (true);
create policy "Anyone can insert relationships" on relationships for insert with check (true);

create policy "Anyone can read photos" on photos for select using (true);
create policy "Anyone can insert photos" on photos for insert with check (true);
create policy "Anyone can update photos" on photos for update using (true);

create policy "Anyone can upload photos" on storage.objects for insert
  with check (bucket_id = 'family-photos');
create policy "Anyone can read photos" on storage.objects for select
  using (bucket_id = 'family-photos');
