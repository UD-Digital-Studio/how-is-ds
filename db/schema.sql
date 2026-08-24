create extension if not exists pgcrypto;

create type workspace_role as enum ('OWNER', 'MANAGER', 'CLIENT');
create type project_status as enum ('PLANNING', 'ON_TRACK', 'AT_RISK', 'PAUSED', 'COMPLETED');
create type item_status as enum ('UPCOMING', 'ACTIVE', 'BLOCKED', 'DONE');
create type report_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type delivery_status as enum ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  locale text not null default 'en' check (locale in ('en', 'fr')),
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  description text,
  status project_status not null default 'PLANNING',
  starts_on date,
  ends_on date,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table project_members (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role workspace_role not null,
  primary key (project_id, user_id)
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  starts_on date,
  due_on date not null,
  progress smallint not null default 0 check (progress between 0 and 100),
  status item_status not null default 'UPCOMING',
  position integer not null default 0
);

create table meeting_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  summary text not null,
  work_completed text,
  next_steps text,
  blocker text,
  progress smallint check (progress between 0 and 100),
  meeting_on date not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  body text not null,
  status report_status not null default 'DRAFT',
  created_by uuid not null references users(id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  recipient_id uuid not null references users(id),
  channel text not null default 'whatsapp',
  external_id text,
  status delivery_status not null default 'QUEUED',
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index project_members_user_idx on project_members(user_id);
create index milestones_project_idx on milestones(project_id, position);
create index updates_project_idx on meeting_updates(project_id, meeting_on desc);
create index reports_project_idx on reports(project_id, created_at desc);
