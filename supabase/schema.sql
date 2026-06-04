create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamptz default now() not null
);

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  novus_project_id text,
  spec_source text not null check (spec_source in ('github', 'manual', 'demo')),
  spec_content text,
  spec_url text,
  drift_score integer default 0 check (drift_score >= 0 and drift_score <= 100),
  last_analyzed timestamptz,
  created_at timestamptz default now() not null
);

create table if not exists drift_zones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references projects(id) on delete cascade,
  feature_name text not null,
  intended_priority text not null check (intended_priority in ('high', 'medium', 'low')),
  actual_usage_score integer not null check (actual_usage_score >= 0 and actual_usage_score <= 100),
  drift_type text not null check (drift_type in ('overbuilt', 'underbuilt', 'misunderstood', 'ghost', 'aligned')),
  novus_event_name text,
  position_x integer,
  position_y integer,
  color text,
  created_at timestamptz default now() not null
);

create table if not exists correction_cards (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references projects(id) on delete cascade,
  drift_zone_id uuid references drift_zones(id) on delete set null,
  title text not null,
  user_story text,
  copy_rewrite text,
  mockup_suggestion text,
  priority text not null check (priority in ('critical', 'high', 'medium', 'low')),
  ai_generated boolean default true not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_projects_created_at on projects(created_at desc);
create index if not exists idx_drift_zones_project_id on drift_zones(project_id);
create index if not exists idx_drift_zones_drift_type on drift_zones(drift_type);
create index if not exists idx_correction_cards_project_id on correction_cards(project_id);
create index if not exists idx_correction_cards_drift_zone_id on correction_cards(drift_zone_id);
create index if not exists idx_correction_cards_priority on correction_cards(priority);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table drift_zones enable row level security;
alter table correction_cards enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

create policy "projects_select_own"
  on projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on projects for delete
  using (auth.uid() = user_id);

create policy "drift_zones_select_own"
  on drift_zones for select
  using (exists (
    select 1 from projects
    where projects.id = drift_zones.project_id
      and projects.user_id = auth.uid()
  ));

create policy "drift_zones_insert_own"
  on drift_zones for insert
  with check (exists (
    select 1 from projects
    where projects.id = drift_zones.project_id
      and projects.user_id = auth.uid()
  ));

create policy "drift_zones_update_own"
  on drift_zones for update
  using (exists (
    select 1 from projects
    where projects.id = drift_zones.project_id
      and projects.user_id = auth.uid()
  ));

create policy "drift_zones_delete_own"
  on drift_zones for delete
  using (exists (
    select 1 from projects
    where projects.id = drift_zones.project_id
      and projects.user_id = auth.uid()
  ));

create policy "correction_cards_select_own"
  on correction_cards for select
  using (exists (
    select 1 from projects
    where projects.id = correction_cards.project_id
      and projects.user_id = auth.uid()
  ));

create policy "correction_cards_insert_own"
  on correction_cards for insert
  with check (exists (
    select 1 from projects
    where projects.id = correction_cards.project_id
      and projects.user_id = auth.uid()
  ));

create policy "correction_cards_update_own"
  on correction_cards for update
  using (exists (
    select 1 from projects
    where projects.id = correction_cards.project_id
      and projects.user_id = auth.uid()
  ));

create policy "correction_cards_delete_own"
  on correction_cards for delete
  using (exists (
    select 1 from projects
    where projects.id = correction_cards.project_id
      and projects.user_id = auth.uid()
  ));

