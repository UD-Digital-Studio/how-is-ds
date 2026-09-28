import Link from"next/link";import{redirect}from"next/navigation";import{db}from"@/lib/db";import{getSession}from"@/lib/auth";import{ClientForm}from"./client-form";import{ManagerForm}from"./manager-form";import{EditClientModal}from"./edit-client-modal";import{EditManagerModal}from"./edit-manager-modal";
const initials=(name:string)=>name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
export default async function People(){
 const s=await getSession();if(!s)redirect("/login");
 const p=await db.query("select p.id,p.name from projects p join project_members pm on pm.project_id=p.id where pm.user_id=$1 and pm.role in ('OWNER','PRODUCT_OWNER') order by p.name",[s.userId]);if(!p.rowCount)redirect("/");
 const ids=p.rows.map(x=>x.id),members=await db.query(`select u.id,u.full_name,u.email,u.phone,u.locale,u.whatsapp_opt_in,case when bool_or(pm.role='PRODUCT_OWNER') then 'PRODUCT_OWNER' when bool_or(pm.role='MANAGER') then 'MANAGER' else 'CLIENT' end role,string_agg(distinct coalesce(pm.title,pm.role::text),' · ') title,string_agg(p.name,', ' order by p.name) projects,json_agg(json_build_object('project',p.id,'name',p.name,'role',pm.role) order by p.name) memberships from users u join project_members pm on pm.user_id=u.id join projects p on p.id=pm.project_id where pm.role in ('CLIENT','MANAGER','PRODUCT_OWNER') and pm.project_id=any($1::uuid[]) group by u.id order by role desc,u.full_name`,[ids]);
 const clients=members.rows.filter(x=>x.role==="CLIENT").length,managers=members.rows.filter(x=>x.role!=="CLIENT").length,whatsapp=members.rows.filter(x=>x.role==="CLIENT"&&x.whatsapp_opt_in&&x.phone).length;
 return <main className="project-page people-page">
  <section className="people-hero"><div><p className="eyebrow">PEOPLE & ACCESS</p><h1>Your project network</h1><p>Assign the right people to each project and keep client communication organized.</p></div><div className="people-metrics"><div><strong>{members.rowCount}</strong><span>Members</span></div><div><strong>{managers}</strong><span>PM / PO</span></div><div><strong>{clients}</strong><span>Clients</span></div><div><strong>{whatsapp}</strong><span>WhatsApp</span></div></div></section>
  <section className="people-actions"><article><span className="people-action-icon manager">＋</span><div><p className="eyebrow">INTERNAL ACCESS</p><h2>Assign PM / PO</h2><p>Give an internal collaborator update access on selected projects.</p></div><ManagerForm projects={p.rows}/></article><article><span className="people-action-icon client">◎</span><div><p className="eyebrow">CLIENT ACCESS</p><h2>Add or assign a client</h2><p>Create read-only access with optional WhatsApp notifications.</p></div><ClientForm projects={p.rows}/></article></section>
  <section className="people-directory"><div className="section-heading"><div><p className="eyebrow">DIRECTORY</p><h2>Project members</h2></div><span>{p.rowCount} projects</span></div>
   {members.rowCount?<div className="members-table-wrap"><table className="members-table"><thead><tr><th>Member</th><th>Role</th><th>Contact</th><th>Assigned projects</th><th>Access & notifications</th><th aria-label="Actions"/></tr></thead><tbody>{members.rows.map(x=><tr key={x.id}>
    <td><div className="table-member"><span className={`member-avatar ${x.role==="CLIENT"?"client":"manager"}`}>{initials(x.full_name)}</span><div><strong>{x.full_name}</strong><small>{x.title}</small></div></div></td>
    <td><em className={`role-pill ${x.role==="CLIENT"?"client":"manager"}`}>{x.role}</em></td>
    <td><div className="table-contact"><a href={`mailto:${x.email}`}>{x.email}</a>{x.role==="CLIENT"&&<small>{x.phone||"No WhatsApp number"}</small>}</div></td>
    <td><span className="table-projects">{x.projects}</span></td>
    <td><span className={`table-access ${x.role==="CLIENT"&&x.whatsapp_opt_in&&x.phone?"enabled":""}`}><i/>{x.role==="CLIENT"?(x.whatsapp_opt_in&&x.phone?"Email + WhatsApp":"Email notifications"):"Can update projects"}</span></td>
    <td>{x.role==="CLIENT"?<EditClientModal client={x}/>:<EditManagerModal manager={x}/>}</td>
   </tr>)}</tbody></table></div>:<div className="empty-state">No project members yet. Use the actions above to build your team.</div>}
  </section>
 </main>
}
