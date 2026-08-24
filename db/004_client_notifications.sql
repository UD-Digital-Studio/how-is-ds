alter table users add column if not exists whatsapp_opt_in boolean not null default false;
alter table users add column if not exists phone_verified_at timestamptz;
alter table users add constraint users_phone_e164 check (phone is null or phone ~ '^\\+[1-9][0-9]{7,14}$');
