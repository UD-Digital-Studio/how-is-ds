import { Dashboard } from "@/components/dashboard";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.mustChange) redirect("/change-password");
  const result = await db.query(`select pm.role,p.id,p.name,p.client_name,p.status,
    coalesce(round(100*sum(case when t.status='DONE' then t.weight else 0 end)/nullif(sum(t.weight),0)),0)::int progress
    from project_members pm join projects p on p.id=pm.project_id
    left join requirements r on r.project_id=p.id left join tasks t on t.requirement_id=r.id where pm.user_id=$1
    group by pm.role,p.id order by p.created_at desc`,[session.userId]);
  if (!result.rowCount) redirect("/login");
  const current=result.rows[0];
  const milestone=(await db.query(`select m.id,m.title,m.starts_on,m.due_on,m.progress,m.position,count(t.id)::int tasks,count(t.id) filter(where t.status='DONE')::int done from milestones m left join requirements r on r.milestone_id=m.id left join tasks t on t.requirement_id=r.id where m.project_id=$1 and m.status in ('ACTIVE','BLOCKED') group by m.id order by m.position limit 1`,[current.id])).rows[0]??null;
  const summary=(await db.query(`select count(*) filter(where t.status='BLOCKED')::int blockers,(select count(*)::int from reports where project_id=$1 and status='PUBLISHED' and published_at>=date_trunc('month',now())) reports from requirements r join tasks t on t.requirement_id=r.id where r.project_id=$1`,[current.id])).rows[0];
  const activity=(await db.query(`select summary title,to_char(created_at,'Mon DD')||' · '||coalesce(nullif(blocker,''),'Project update') meta,case when blocker is not null and blocker<>'' then 'risk' else 'done' end type from meeting_updates where project_id=$1 order by created_at desc limit 3`,[current.id])).rows;
  const roadmap=(await db.query(`select m.id,m.position,m.title,m.starts_on,m.due_on,m.status,m.progress,count(distinct r.id)::int requirements,count(t.id)::int tasks from milestones m left join requirements r on r.milestone_id=m.id left join tasks t on t.requirement_id=r.id where m.project_id=$1 group by m.id order by m.position`,[current.id])).rows;
  const delivery=(await db.query(`select nd.status,nd.updated_at from notification_deliveries nd join reports r on r.id=nd.report_id where r.project_id=$1 order by nd.updated_at desc limit 1`,[current.id])).rows[0]??null;
  return <Dashboard locale={await getLocale()} userName={session.name} role={current.role} assignedProjects={result.rows} focus={{...current,milestone}} summary={summary} activities={activity} roadmap={roadmap} notification={{configured:!!(process.env.EVOLUTION_API_URL&&process.env.EVOLUTION_API_KEY&&process.env.EVOLUTION_INSTANCE),last:delivery}} />;
}
