alter table users drop constraint if exists users_phone_e164;

alter table users add constraint users_phone_e164
  check (phone is null or phone ~ '^[+][1-9][0-9]{7,14}$');
