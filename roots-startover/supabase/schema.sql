create extension if not exists pgcrypto;

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
  generation int not null default 0,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  related_person_id uuid not null references people(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('parent', 'spouse', 'sibling')),
  created_at timestamptz default now(),
  unique(person_id, related_person_id, relationship_type)
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  uploaded_by text,
  taken_date date,
  tagged_people uuid[] default '{}',
  rotation int default 0,
  created_at timestamptz default now()
);

create index if not exists photos_created_at_idx on photos (created_at desc);
create index if not exists photos_tagged_people_idx on photos using gin (tagged_people);
create index if not exists people_generation_idx on people (generation, sort_order);

insert into storage.buckets (id, name, public)
values ('family-photos', 'family-photos', true)
on conflict (id) do nothing;

alter table people enable row level security;
alter table relationships enable row level security;
alter table photos enable row level security;

create policy "Anyone read people" on people for select using (true);
create policy "Anyone insert people" on people for insert with check (true);
create policy "Anyone update people" on people for update using (true);
create policy "Anyone delete people" on people for delete using (true);

create policy "Anyone read relationships" on relationships for select using (true);
create policy "Anyone insert relationships" on relationships for insert with check (true);
create policy "Anyone update relationships" on relationships for update using (true);
create policy "Anyone delete relationships" on relationships for delete using (true);

create policy "Anyone read photos" on photos for select using (true);
create policy "Anyone insert photos" on photos for insert with check (true);
create policy "Anyone update photos" on photos for update using (true);
create policy "Anyone delete photos" on photos for delete using (true);

create policy "Upload photos" on storage.objects for insert with check (bucket_id = 'family-photos');
create policy "Read photos" on storage.objects for select using (bucket_id = 'family-photos');
create policy "Update photos" on storage.objects for update using (bucket_id = 'family-photos');
create policy "Delete photos" on storage.objects for delete using (bucket_id = 'family-photos');
