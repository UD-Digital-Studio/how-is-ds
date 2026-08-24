"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";

type Project = { id: string; name: string };
type Props = { name: string; role: string; projects: Project[]; locale: "en" | "fr" };

export function AppNavigation({ name, role, projects, locale }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const close = () => setOpen(false);
  const submenu = (items: { href: string; label: string }[]) => <div className="nav-submenu">{items.map((item) =>
    <Link key={item.href + item.label} className={pathname === item.href ? "current" : ""} href={item.href} onClick={close}>{item.label}</Link>
  )}</div>;

  return <>
    <aside className={`sidebar global-sidebar ${open ? "open" : ""}`}>
      <Link href="/" className="brand" onClick={close}><img src="/logo-ds.png" alt="How's DS"/><span>How&apos;s DS</span></Link>
      <nav className="nested-nav">
        <Link className={active("/") ? "active" : ""} href="/" onClick={close}><span className="nav-symbol">▦</span>Overview</Link>
        <details key={`projects-${pathname}`} open={pathname.startsWith("/projects") || pathname === "/import"}>
          <summary className={pathname.startsWith("/projects") || pathname === "/import" ? "active" : ""}><span className="nav-symbol">▣</span>Projects<span className="nav-count">{projects.length}</span><i>⌄</i></summary>
          {submenu([
            { href: "/projects", label: "All projects" },
            ...projects.map((project) => ({ href: `/projects/${project.id}`, label: project.name })),
            ...(role === "OWNER" ? [{ href: "/projects/new", label: "＋ New project" }] : []),
            ...(role !== "CLIENT" ? [{ href: "/import", label: "Import roadmap" }] : []),
          ])}
        </details>
        <details key={`reports-${pathname}`} open={pathname.startsWith("/reports")}>
          <summary className={pathname.startsWith("/reports") ? "active" : ""}><span className="nav-symbol">▤</span>Reports<i>⌄</i></summary>
          {submenu([
            { href: "/reports", label: "Report history" },
            ...(role !== "CLIENT" ? [{ href: "/reports/generate", label: "Generate report" }, { href: "/reports/new", label: "Manual report" }] : []),
          ])}
        </details>
        {role === "OWNER" && <details key={`people-${pathname}`} open={pathname.startsWith("/people")}>
          <summary className={pathname.startsWith("/people") ? "active" : ""}><span className="nav-symbol">♙</span>People<i>⌄</i></summary>
          {submenu([{ href: "/people", label: "Member directory" }, { href: "/people#internal-access", label: "Assign PM / PO" }, { href: "/people#client-access", label: "Add client" }])}
        </details>}
        {role !== "CLIENT" && <details key={`notifications-${pathname}`} open={pathname.startsWith("/notifications")}>
          <summary className={pathname.startsWith("/notifications") ? "active" : ""}><span className="nav-symbol">◉</span>Notifications<i>⌄</i></summary>
          {submenu([{ href: "/notifications", label: "Delivery log" }, { href: "/notifications/test", label: "Send test" }])}
        </details>}
      </nav>
      <div className="sidebar-foot">
        <LocaleSwitcher locale={locale}/>
        <a href="/logout">↪ Logout</a>
        <div className="profile"><span>{initials}</span><div><strong>{name}</strong><small>{role}</small></div></div>
      </div>
    </aside>
    {open && <button className="scrim global-scrim" aria-label="Close navigation" onClick={() => setOpen(false)}/>} 
    <header className="global-mobile-header">
      <button className="menu" onClick={() => setOpen(true)} aria-label="Open navigation"><span/><span/><span/></button>
      <Link href="/" className="mobile-brand"><img src="/logo-ds.png" alt="How's DS"/><b>How&apos;s DS</b></Link>
      <LocaleSwitcher locale={locale}/>
    </header>
  </>;
}

