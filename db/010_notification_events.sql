alter type delivery_status add value if not exists 'READ';
alter table notification_deliveries add column if not exists updated_at timestamptz not null default now();
create index if not exists notification_external_idx on notification_deliveries(external_id) where external_id is not null;
