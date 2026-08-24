import Link from"next/link";import{redirect}from"next/navigation";import{db}from"@/lib/db";import{getSession}from"@/lib/auth";
export default async function Reports(){
 const s=await getSession();if(!s)redirect("/login");
 const r=await db.query(`select r.id,r.title,r.status,r.created_at,r.published_at,p.name project_name,pm.role,count(nd.id)::int deliveries,count(nd.id) filter(where nd.status='FAILED')::int failed from project_members pm join projects p on p.id=pm.project_id join reports r on r.project_id=p.id left join notification_deliveries nd on nd.report_id=r.id where pm.user_id=$1 and (pm.role<>'CLIENT' or r.status='PUBLISHED') group by r.id,p.name,pm.role order by r.created_at desc`,[s.userId]);
 const canCreate=r.rows.some(x=>x.role!=="CLIENT");
 return <main className="project-page"><div className="project-top"><Link href="/">← Dashboard</Link>{canCreate&&<div><Link href="/reports/generate">Generate report</Link><Link href="/reports/new" className="primary">＋ Manual report</Link></div>}</div>
  <section className="project-hero"><p className="eyebrow">CLIENT COMMUNICATION</p><h1>Reports</h1><strong>{r.rowCount} visible report{r.rowCount===1?"":"s"}</strong></section>
  {r.rows.length?<section className="reports-table-wrap"><table className="reports-table"><thead><tr><th>Project</th><th>Report</th><th>Status</th><th>Date</th><th>Delivery</th><th aria-label="Open report"/></tr></thead><tbody>{r.rows.map(x=><tr key={x.id}>
   <td><span className="report-project">{x.project_name}</span></td>
   <td><strong>{x.title}</strong></td>
   <td><em className={`report-status ${x.status.toLowerCase()}`}>{x.status}</em></td>
   <td><time>{x.published_at?new Date(x.published_at).toLocaleDateString():"Not published"}</time></td>
   <td><span className={x.failed?"delivery-summary failed":"delivery-summary"}>{x.role==="CLIENT"?"—":x.deliveries?`${x.deliveries-x.failed} sent${x.failed?`, ${x.failed} failed`:""}`:"No delivery yet"}</span></td>
   <td><Link href={`/reports/${x.id}`} className="table-open" aria-label={`Open ${x.title}`}>View →</Link></td>
  </tr>)}</tbody></table></section>:<div className="empty-state">No reports yet.</div>}
 </main>
}
