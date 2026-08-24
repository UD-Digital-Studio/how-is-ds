"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/locale-switcher";

type Props = { name: string; role: string; projectCount: number; locale: "en" | "fr" };

export function AppNavigation({ name, role, projectCount, locale }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const links = [
    { href: "/", label: "Overview", icon: "▦", show: true },
    { href: "/projects", label: "Projects", icon: "▣", show: true, count: projectCount },
    { href: "/reports", label: "Reports", icon: "▤", show: true },
    { href: "/people", label: "People", icon: "♙", show: role === "OWNER" },
    { href: "/notifications", label: "Notifications", icon: "◉", show: role !== "CLIENT" },
  ];
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return <>
    <aside className={`sidebar global-sidebar ${open ? "open" : ""}`}>
      <Link href="/" className="brand" onClick={() => setOpen(false)}><img src="/logo-ds.png" alt="How's DS"/><span>How&apos;s DS</span></Link>
      <nav>{links.filter((link) => link.show).map((link) =>
        <Link key={link.href} className={active(link.href) ? "active" : ""} href={link.href} onClick={() => setOpen(false)}>
          <span className="nav-symbol">{link.icon}</span>{link.label}{link.count !== undefined && <span className="nav-count">{link.count}</span>}
        </Link>)}</nav>
      <div className="sidebar-foot">
        <LocaleSwitcher locale={locale}/>
        <Link href="/logout">↪ Logout</Link>
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

