-- Run this once in your Supabase project's SQL editor.

create table if not exists extra_help_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  census int,
  extras jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists extra_help_entries_date_idx on extra_help_entries (entry_date);

alter table extra_help_entries enable row level security;

-- Public app, no login: anyone with the link can read and write.
-- Fine here since the table holds no patient data, only staffing counts.
create policy "Public can read entries"
  on extra_help_entries for select
  to anon
  using (true);

create policy "Public can insert entries"
  on extra_help_entries for insert
  to anon
  with check (true);

create policy "Public can update entries"
  on extra_help_entries for update
  to anon
  using (true);

create policy "Public can delete entries"
  on extra_help_entries for delete
  to anon
  using (true);

-- Keep updated_at current on edits.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists extra_help_entries_updated_at on extra_help_entries;
create trigger extra_help_entries_updated_at
  before update on extra_help_entries
  for each row execute function set_updated_at();
