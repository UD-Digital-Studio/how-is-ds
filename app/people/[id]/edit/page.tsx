import Link from"next/link";import{notFound,redirect}from"next/navigation";import{db}from"@/lib/db";import{getSession}from"@/lib/auth";import{EditClientForm}from"./edit-form";
export default async function EditClient({params}:{params:Promise<{id:string}>}){
 const session=await getSession();if(!session)redirect("/login");const{id}=await params;
 const result=await db.query(`select distinct u.id,u.full_name,u.email,u.phone,u.locale,u.whatsapp_opt_in
  from users u join project_members client on client.user_id=u.id and client.role='CLIENT'
  join project_members owner on owner.project_id=client.project_id and owner.role='OWNER'
  where u.id=$1 and owner.user_id=$2`,[id,session.userId]);
 if(!result.rowCount)notFound();
 const projects=await db.query(`select p.name from projects p join project_members pm on pm.project_id=p.id where pm.user_id=$1 and pm.role='CLIENT' order by p.name`,[id]);
 return <main className="project-page"><div className="project-top"><Link href="/people">← Project members</Link></div>
  <section className="project-hero"><p className="eyebrow">CLIENT DETAILS</p><h1>Edit {result.rows[0].full_name}</h1><strong>{projects.rows.map(x=>x.name).join(" · ")}</strong></section>
  <section className="auth-card update-card client-edit-card"><EditClientForm client={result.rows[0]}/></section>
 </main>
}

