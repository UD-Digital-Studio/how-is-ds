import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { retryDelivery } from "./actions";

const PAGE_SIZES = [10, 20, 50, 100] as const;

export default async function Notifications({ searchParams }: { searchParams: Promise<{ page?: string; perPage?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const access = await db.query(
    "select 1 from project_members where user_id=$1 and role in ($role$OWNER$role$,$role$MANAGER$role$) limit 1",
    [session.userId],
  );
  if (!access.rowCount) redirect("/");

  const query = await searchParams;
  const requestedPage = Number.parseInt(query.page || "1", 10);
  const requestedPageSize = Number.parseInt(query.perPage || "10", 10);
  const pageSize = PAGE_SIZES.includes(requestedPageSize as (typeof PAGE_SIZES)[number]) ? requestedPageSize : 10;
  const count = await db.query(
    `select count(*)::int total
     from notification_deliveries nd
     join reports r on r.id=nd.report_id
     join project_members pm on pm.project_id=r.project_id
     where pm.user_id=$1 and pm.role in ($role$OWNER$role$,$role$MANAGER$role$)`,
    [session.userId],
  );
  const total = count.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1;
  const offset = (page - 1) * pageSize;

  const deliveries = await db.query(
    `select nd.id,nd.channel,nd.status,nd.created_at,nd.error_message,
            u.full_name,r.title,p.name project_name
     from notification_deliveries nd
     join users u on u.id=nd.recipient_id
     join reports r on r.id=nd.report_id
     join projects p on p.id=r.project_id
     join project_members pm on pm.project_id=p.id
     where pm.user_id=$1 and pm.role in ($role$OWNER$role$,$role$MANAGER$role$)
     order by nd.created_at desc
     limit $2 offset $3`,
    [session.userId, pageSize, offset],
  );

  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);

  return <main className="project-page">
    <div className="project-top"><Link href="/">← Dashboard</Link><Link href="/notifications/test" className="primary">Send test</Link></div>
    <section className="project-hero"><p className="eyebrow">DELIVERY LOG</p><h1>Notifications</h1></section>
    <div className="notification-list-tools"><div className="pagination-summary">Showing {total ? offset + 1 : 0}–{Math.min(offset + pageSize, total)} of {total} deliveries</div><form method="get" className="page-size-form"><label>Deliveries per page<select name="perPage" defaultValue={pageSize}>{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label><button type="submit">Apply</button></form></div>
    <section className="report-list">{deliveries.rows.length ? deliveries.rows.map((item) => <div className="delivery-row" key={item.id}>
      <div><span>{item.channel.toUpperCase()} · {item.project_name}</span><strong>{item.title}</strong><small>{item.full_name} · {new Date(item.created_at).toLocaleString()}</small>{item.error_message && <small className="delivery-error">{item.error_message}</small>}</div>
      <em className={item.status.toLowerCase()}>{item.status}</em>
      {item.status === "FAILED" && <form action={retryDelivery}><input type="hidden" name="delivery" value={item.id}/><button className="remove-button">Retry</button></form>}
    </div>) : <div className="empty-state">No notification deliveries yet.</div>}</section>
    {totalPages > 1 && <nav className="pagination" aria-label="Notification pages">
      {page > 1 ? <Link href={`/notifications?page=${page - 1}&perPage=${pageSize}`} rel="prev">← Previous</Link> : <span className="disabled">← Previous</span>}
      <div>{pages.map((number) => <Link key={number} href={`/notifications?page=${number}&perPage=${pageSize}`} className={number === page ? "current" : ""} aria-current={number === page ? "page" : undefined}>{number}</Link>)}</div>
      {page < totalPages ? <Link href={`/notifications?page=${page + 1}&perPage=${pageSize}`} rel="next">Next →</Link> : <span className="disabled">Next →</span>}
    </nav>}
  </main>;
}
