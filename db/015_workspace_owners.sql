alter table users add column if not exists can_own_projects boolean not null default false;
update users u set can_own_projects=true where exists(select 1 from project_members pm where pm.user_id=u.id and pm.role='OWNER');
