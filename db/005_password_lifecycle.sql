alter table users add column if not exists must_change_password boolean not null default false;
alter table users add column if not exists password_changed_at timestamptz;
