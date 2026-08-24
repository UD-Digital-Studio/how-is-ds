create or replace function refresh_requirement_and_milestone() returns trigger language plpgsql as $$
declare req uuid; old_req uuid; ms uuid; old_ms uuid;
begin
  req:=case when tg_op='DELETE' then old.requirement_id else new.requirement_id end;
  old_req:=case when tg_op='UPDATE' then old.requirement_id else null end;
  select milestone_id into ms from requirements where id=req;
  if old_req is not null and old_req<>req then select milestone_id into old_ms from requirements where id=old_req; end if;
  update requirements r set status=case
    when not exists(select 1 from tasks where requirement_id=r.id) then 'NOT_STARTED'::requirement_status
    when exists(select 1 from tasks where requirement_id=r.id and status='BLOCKED') then 'BLOCKED'::requirement_status
    when not exists(select 1 from tasks where requirement_id=r.id and status<>'DONE') then 'DONE'::requirement_status
    when exists(select 1 from tasks where requirement_id=r.id and status<>'NOT_STARTED') then 'IN_PROGRESS'::requirement_status
    else 'NOT_STARTED'::requirement_status end where id in(req,old_req);
  update milestones m set
    progress=coalesce((select round(100*sum(case when t.status='DONE' then t.weight else 0 end)/nullif(sum(t.weight),0)) from requirements r join tasks t on t.requirement_id=r.id where r.milestone_id=m.id),0),
    status=case when exists(select 1 from requirements r where r.milestone_id=m.id and r.status='BLOCKED') then 'BLOCKED'::item_status when exists(select 1 from requirements r where r.milestone_id=m.id) and not exists(select 1 from requirements r where r.milestone_id=m.id and r.status<>'DONE') then 'DONE'::item_status when exists(select 1 from requirements r where r.milestone_id=m.id and r.status in('IN_PROGRESS','DONE')) then 'ACTIVE'::item_status else 'UPCOMING'::item_status end
  where id in(ms,old_ms);
  return coalesce(new,old);
end $$;
drop trigger if exists tasks_refresh_progress on tasks;
create trigger tasks_refresh_progress after insert or update or delete on tasks for each row execute function refresh_requirement_and_milestone();
