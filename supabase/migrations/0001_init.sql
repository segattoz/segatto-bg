-- Pulse CRM - initial schema
-- Tables: profiles, leads, meetings, meeting_leads, lead_analysis, lead_history
-- Design notes:
--   * All primary keys are UUIDs, defaulted with gen_random_uuid().
--   * Row Level Security restricts every table to rows owned by auth.uid(),
--     scoped through leads/meetings.user_id (or joins for the two link
--     tables), so this schema is multi-tenant safe by default.
--   * `leads.temperature` / `leads.score` are written by the app after it
--     receives the n8n analysis response -- the DB does not compute them.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create type public.lead_status as enum (
  'novo',
  'contato_inicial',
  'reuniao_agendada',
  'proposta',
  'negociacao',
  'fechado',
  'perdido'
);

create type public.lead_temperature as enum ('hot', 'warm', 'cold');

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  job_title text,
  phone text,
  email text,
  source text,
  status public.lead_status not null default 'novo',
  temperature public.lead_temperature not null default 'cold',
  score integer not null default 0 check (score between 0 and 100),
  ranking integer,
  previous_ranking integer,
  insights jsonb not null default '[]'::jsonb,
  next_action text,
  next_action_deadline date,
  responsible_name text,
  last_meeting_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_score_idx on public.leads (user_id, score desc);

alter table public.leads enable row level security;

create policy "Leads are managed by owner" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- meetings
-- ---------------------------------------------------------------------------
create type public.meeting_status as enum ('pendente', 'processando', 'processada', 'erro');

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  meeting_date date not null,
  meeting_time time not null,
  participants jsonb not null default '[]'::jsonb,
  minutes text not null default '',
  observations text,
  status public.meeting_status not null default 'pendente',
  analysis_summary text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meetings_user_id_idx on public.meetings (user_id);

alter table public.meetings enable row level security;

create policy "Meetings are managed by owner" on public.meetings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- meeting_leads (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists public.meeting_leads (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (meeting_id, lead_id)
);

create index if not exists meeting_leads_meeting_id_idx on public.meeting_leads (meeting_id);
create index if not exists meeting_leads_lead_id_idx on public.meeting_leads (lead_id);

alter table public.meeting_leads enable row level security;

create policy "Meeting leads are managed by owner" on public.meeting_leads
  for all using (
    exists (select 1 from public.meetings m where m.id = meeting_id and m.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.meetings m where m.id = meeting_id and m.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- lead_analysis
-- ---------------------------------------------------------------------------
create table if not exists public.lead_analysis (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  score_before integer not null,
  score_after integer not null,
  temperature_before public.lead_temperature not null,
  temperature_after public.lead_temperature not null,
  priority integer not null,
  confidence numeric(4, 3) not null,
  reason text not null,
  next_action text,
  next_action_deadline date,
  insights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_analysis_lead_id_idx on public.lead_analysis (lead_id);
create index if not exists lead_analysis_meeting_id_idx on public.lead_analysis (meeting_id);

alter table public.lead_analysis enable row level security;

create policy "Lead analysis is managed by owner" on public.lead_analysis
  for all using (
    exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- lead_history
-- ---------------------------------------------------------------------------
create type public.lead_history_type as enum (
  'meeting',
  'score_change',
  'temperature_change',
  'status_change',
  'note',
  'ai_analysis'
);

create table if not exists public.lead_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  type public.lead_history_type not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_history_lead_id_idx on public.lead_history (lead_id, created_at desc);

alter table public.lead_history enable row level security;

create policy "Lead history is managed by owner" on public.lead_history
  for all using (
    exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- updated_at helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at
  before update on public.meetings
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- storage bucket for temporary meeting audio uploads
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('meeting-audio', 'meeting-audio', false)
on conflict (id) do nothing;

create policy "Users manage their own meeting audio"
  on storage.objects for all
  using (bucket_id = 'meeting-audio' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'meeting-audio' and auth.uid()::text = (storage.foldername(name))[1]);
