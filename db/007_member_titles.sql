alter table project_members add column if not exists title text;
alter table project_members add column if not exists notifications_enabled boolean not null default true;
