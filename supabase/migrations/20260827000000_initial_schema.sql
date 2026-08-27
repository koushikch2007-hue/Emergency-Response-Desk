-- Production SQL Migration for Emergency Response Desk
-- Enables Extensions, Custom Enums, Tables, RLS Policies, Indexes, and Triggers

create extension if not exists pgcrypto;

-- Enums
create type public.user_role as enum (
  'reporter',
  'authority',
  'admin'
);

create type public.incident_category as enum (
  'accident',
  'fire',
  'medical',
  'crime',
  'flood_weather',
  'utility',
  'hazardous_material',
  'infrastructure',
  'public_safety',
  'other'
);

create type public.incident_severity as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.priority_level as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.incident_status as enum (
  'submitted',
  'acknowledged',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
  'rejected'
);

create type public.actor_type as enum (
  'reporter',
  'authority',
  'admin',
  'system',
  'ai'
);

create type public.comment_visibility as enum (
  'public',
  'internal'
);

-- Profiles Table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'reporter',
  department text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (
    full_name is null or char_length(full_name) <= 160
  ),
  constraint profiles_phone_length check (
    phone is null or char_length(phone) <= 40
  ),
  constraint profiles_department_length check (
    department is null or char_length(department) <= 160
  )
);

-- Incidents Table
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text not null,
  category public.incident_category not null,
  user_severity public.incident_severity not null,
  is_injured boolean not null default false,
  is_trapped boolean not null default false,
  is_life_threatening boolean not null default false,
  is_active boolean not null default true,
  involves_vulnerable_people boolean not null default false,
  people_affected integer not null default 0,
  location_description text,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  reporter_name text,
  reporter_phone text,
  reporter_email text,
  priority_score integer not null default 0,
  deterministic_priority public.priority_level not null default 'low',
  final_priority public.priority_level not null default 'low',
  priority_reasons jsonb not null default '[]'::jsonb,
  ai_category public.incident_category,
  ai_summary text,
  ai_hazards jsonb default '[]'::jsonb,
  ai_departments jsonb default '[]'::jsonb,
  ai_duplicate_signals jsonb default '[]'::jsonb,
  ai_clarifying_questions jsonb default '[]'::jsonb,
  ai_urgency public.priority_level,
  status public.incident_status not null default 'submitted',
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_department text,
  resolution_summary text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  constraint title_length check (char_length(title) >= 5 and char_length(title) <= 120),
  constraint description_length check (char_length(description) >= 20 and char_length(description) <= 5000),
  constraint people_affected_range check (people_affected >= 0 and people_affected <= 100000),
  constraint valid_latitude check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint valid_longitude check (longitude is null or (longitude >= -180 and longitude <= 180))
);

-- Incident Media Table
create table public.incident_media (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size_bytes integer not null,
  created_at timestamptz not null default now()
);

-- Incident Status History Table
create table public.incident_history (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  previous_status public.incident_status,
  new_status public.incident_status not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_type public.actor_type not null default 'system',
  notes text,
  created_at timestamptz not null default now()
);

-- Incident Comments & Notes Table
create table public.incident_comments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  author_role public.user_role not null,
  visibility public.comment_visibility not null default 'public',
  content text not null,
  created_at timestamptz not null default now()
);

-- Notifications Table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'status_change',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Audit Logs Table
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role public.user_role,
  action text not null,
  target_entity text not null,
  target_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Database Indexes for High-Performance Queueing and Filtering
create index idx_incidents_reporter_id on public.incidents(reporter_id);
create index idx_incidents_status on public.incidents(status);
create index idx_incidents_category on public.incidents(category);
create index idx_incidents_final_priority on public.incidents(final_priority);
create index idx_incidents_assigned_to on public.incidents(assigned_to);
create index idx_incidents_created_at on public.incidents(created_at desc);
create index idx_incidents_queue_order on public.incidents(final_priority desc, created_at asc);
create index idx_incident_media_incident_id on public.incident_media(incident_id);
create index idx_incident_history_incident_id on public.incident_history(incident_id);
create index idx_incident_comments_incident_id on public.incident_comments(incident_id);
create index idx_notifications_user_unread on public.notifications(user_id, is_read, created_at desc);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_media enable row level security;
alter table public.incident_history enable row level security;
alter table public.incident_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- RLS Policies
-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Authorities and Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('authority', 'admin')
    )
  );

create policy "Admins can update profiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Incidents Policies
create policy "Reporters can view own incidents" on public.incidents
  for select using (reporter_id = auth.uid());

create policy "Authorities and Admins can view all incidents" on public.incidents
  for select using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('authority', 'admin')
    )
  );

create policy "Reporters can create incidents" on public.incidents
  for insert with check (reporter_id = auth.uid());

create policy "Authorities and Admins can update incidents" on public.incidents
  for update using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role in ('authority', 'admin')
    )
  );

-- Incident Media Policies
create policy "Media viewable by reporter or authorities" on public.incident_media
  for select using (
    exists (
      select 1 from public.incidents i
      where i.id = incident_media.incident_id
      and (
        i.reporter_id = auth.uid()
        or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('authority', 'admin'))
      )
    )
  );

create policy "Reporters can upload media for own incidents" on public.incident_media
  for insert with check (
    exists (
      select 1 from public.incidents i
      where i.id = incident_media.incident_id and i.reporter_id = auth.uid()
    )
  );

-- Incident Comments Policies
create policy "Public comments viewable by reporter or authorities" on public.incident_comments
  for select using (
    (visibility = 'public' and exists (
      select 1 from public.incidents i where i.id = incident_comments.incident_id and i.reporter_id = auth.uid()
    ))
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('authority', 'admin'))
  );

create policy "Reporters can create public comments on own incidents" on public.incident_comments
  for insert with check (
    author_id = auth.uid()
    and visibility = 'public'
    and exists (select 1 from public.incidents i where i.id = incident_comments.incident_id and i.reporter_id = auth.uid())
  );

create policy "Authorities can create comments" on public.incident_comments
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('authority', 'admin'))
  );

-- Notifications Policies
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- Audit Logs Policies
create policy "Admins can view audit logs" on public.audit_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Function and Trigger to sync Auth Users -> Profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'reporter'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger for auto updating updated_at column
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_timestamp
  before update on public.profiles
  for each row execute function public.update_timestamp();

create trigger update_incidents_timestamp
  before update on public.incidents
  for each row execute function public.update_timestamp();
