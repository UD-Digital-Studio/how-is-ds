"use client";

import { useState } from "react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/locale-switcher";

const icons = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  folder: <><path d="M3 7.5V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></>,
  report: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11a4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.87"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.09 14H3v-4h.09A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.09V3h4v.09A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9c.16.61.72 1.03 1.35 1.03H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
};

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}

type AssignedProject={id:string;name:string;client_name:string;status:string;progress:number};
type Focus=AssignedProject&{milestone:null|{title:string;progress:number;position:number;tasks:number;done:number}};type Activity={title:string;meta:string;type:"done"|"risk"|"report"};
type RoadmapItem={id:string;position:number;title:string;starts_on:string|null;due_on:string|null;status:"UPCOMING"|"ACTIVE"|"BLOCKED"|"DONE";progress:number;requirements:number;tasks:number};
export function Dashboard({locale,userName,role,assignedProjects,focus,summary,activities,roadmap,notification}:{locale:"en"|"fr";userName:string;role:string;assignedProjects:AssignedProject[];focus:Focus;summary:{blockers:number;reports:number};activities:Activity[];roadmap:RoadmapItem[];notification:{configured:boolean;last:null|{status:string;updated_at:string}}}) {
  const language=locale.toUpperCase() as "EN"|"FR";
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const initials=userName.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
  const nextMilestone=roadmap.find(x=>x.status==="UPCOMING");

  const copy = language === "EN" ? {
    greeting: `Good morning, ${userName.split(" ")[0]}`,
    subtitle: "Here’s the clearest view of your projects today.",
    overview: "Portfolio overview",
    projects: "Active projects",
    onTrack: "On track",
    blockers: "Open blockers",
    reports: "Reports this month",
    current: "Current focus",
    roadmap: "Project roadmap",
    activity: "Latest activity",
    update: "Add meeting update",
    viewProject: "Open project",
    nextMilestone: "Next major milestone",
    days: "62 days remaining",
  } : {
    greeting: `Bonjour, ${userName.split(" ")[0]}`,
    subtitle: "Voici la vue la plus claire de vos projets aujourd’hui.",
    overview: "Vue d’ensemble",
    projects: "Projets actifs",
    onTrack: "Dans les délais",
    blockers: "Blocages ouverts",
    reports: "Rapports ce mois",
    current: "Priorité actuelle",
    roadmap: "Feuille de route",
    activity: "Activité récente",
    update: "Ajouter le compte rendu",
    viewProject: "Ouvrir le projet",
    nextMilestone: "Prochain jalon majeur",
    days: "62 jours restants",
  };

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="brand"><img src="/logo-ds.png" alt="How's DS" /><span>How's DS</span></div>
        <nav>
          <Link className="active" href="/"><Icon name="grid" />Overview</Link>
          <Link href="/projects"><Icon name="folder" />Projects <span className="nav-count">{assignedProjects.length}</span></Link>
          <Link href="/reports"><Icon name="report" />Reports</Link>
          {role === "OWNER" && <Link href="/people"><Icon name="users" />People</Link>}
          {role !== "CLIENT" && <Link href="/notifications"><Icon name="bell" />Notifications</Link>}
        </nav>
        <div className="sidebar-foot">
          <Link href="/logout"><Icon name="settings" />Logout</Link>
          <div className="profile"><span>{initials}</span><div><strong>{userName}</strong><small>{role.replaceAll("_"," ")}</small></div></div>
        </div>
      </aside>

      {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main>
        <header>
          <button className="menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><span/><span/><span/></button>
          <div className="mobile-brand"><img src="/logo-ds.png" alt="How's DS" /><b>How's DS</b></div>
          <div className="header-actions">
            <LocaleSwitcher locale={locale}/>
            <button className="icon-button" aria-label="Notifications"><Icon name="bell" /><i /></button>
            <button className="avatar">{initials}</button>
          </div>
        </header>

        <div className="page">
          <section className="welcome">
            <div><p className="eyebrow">{new Intl.DateTimeFormat(locale,{weekday:"long",day:"numeric",month:"long"}).format(new Date())}</p><h1>{copy.greeting}</h1><p>{copy.subtitle}</p></div>
            {role !== "CLIENT" && <Link className="primary" href="/updates/new">＋ {copy.update}</Link>}
          </section>

          <section>
            <div className="section-heading"><h2>{copy.overview}</h2><span>{new Intl.DateTimeFormat(locale,{hour:"2-digit",minute:"2-digit"}).format(new Date())}</span></div>
            <div className="stats-grid">
              <article className="stat"><div className="stat-icon purple"><Icon name="folder" /></div><div><strong>{assignedProjects.length}</strong><span>{copy.projects}</span></div><em>{role}</em></article>
              <article className="stat"><div className="stat-icon green">✓</div><div><strong>{assignedProjects.filter(x=>x.status==="ON_TRACK").length}</strong><span>{copy.onTrack}</span></div><em>{assignedProjects.length?Math.round(100*assignedProjects.filter(x=>x.status==="ON_TRACK").length/assignedProjects.length):0}%</em></article>
              <article className="stat"><div className="stat-icon orange">!</div><div><strong>{summary.blockers}</strong><span>{copy.blockers}</span></div><em className="warning">{summary.blockers?"Needs review":"Clear"}</em></article>
              <article className="stat"><div className="stat-icon blue"><Icon name="report" /></div><div><strong>{summary.reports}</strong><span>{copy.reports}</span></div><em>Published</em></article>
            </div>
          </section>

          <div className="content-grid">
            <section className="project-panel card">
              <div className="card-head"><div><p className="eyebrow">{copy.current}</p><h2>{focus.name}</h2></div><span className="status on-track"><i/> {focus.status.replaceAll("_"," ")}</span></div>
              <div className="progress-copy"><span>Overall progress</span><strong>{focus.progress}%</strong></div>
              <div className="progress large"><i style={{ width: `${focus.progress}%` }} /></div>
              <div className="sprint-focus">
                <div className="sprint-number">{String(focus.milestone?.position??0).padStart(2,"0")}</div>
                <div><small>CURRENT MILESTONE</small><strong>{focus.milestone?.title??"No active milestone"}</strong><span>{focus.milestone?.done??0} of {focus.milestone?.tasks??0} tasks completed</span></div>
                <b>{focus.milestone?.progress??0}%</b>
              </div>
              <div className="milestone">
                <div className="milestone-icon">◆</div>
                <div><small>{copy.nextMilestone}</small><strong>{nextMilestone?.title??"No upcoming milestone"}</strong><span>{nextMilestone?.due_on?new Date(nextMilestone.due_on).toLocaleDateString(locale):"No due date"}</span></div>
              </div>
              <Link className="secondary" href={`/projects/${focus.id}`}>{copy.viewProject} →</Link>
            </section>

            <section className="activity card">
              <div className="card-head"><h2>{copy.activity}</h2><button>View all</button></div>
              <div className="activity-list">
                {activities.map((item) => <div className="activity-item" key={item.title+item.meta}><i className={item.type}>{item.type === "done" ? "✓" : item.type === "risk" ? "!" : "↗"}</i><div><strong>{item.title}</strong><span>{item.meta}</span></div></div>)}
              </div>
              <div className="whatsapp"><span>◉</span><div><strong>{notification.configured?"WhatsApp configured":"WhatsApp not configured"}</strong><small>{notification.last?`Last delivery: ${notification.last.status} · ${new Date(notification.last.updated_at).toLocaleString(locale)}`:"No delivery recorded"}</small></div></div>
            </section>
          </div>

          <section className="roadmap-section">
            <div className="section-heading"><h2>{copy.roadmap}</h2><button className="text-button">View full roadmap →</button></div>
            <div className="roadmap-scroll">
              {roadmap.map((sprint) => <article className={`sprint-card ${sprint.status.toLowerCase()}`} key={sprint.id}>
                <div><span>S{sprint.position}</span><em>{sprint.status.replaceAll("_"," ")}</em></div>
                <strong>{sprint.title}</strong><small>{sprint.starts_on?new Date(sprint.starts_on).toLocaleDateString():"No dates"}{sprint.due_on?` – ${new Date(sprint.due_on).toLocaleDateString()}`:""}</small>
                <small>{sprint.requirements} FR · {sprint.tasks} tasks</small><div className="progress"><i style={{ width: `${sprint.progress}%` }} /></div>
              </article>)}
            </div>
          </section>

          <section className="all-projects">
            <div className="section-heading"><h2>All projects</h2><button className="text-button">Manage projects →</button></div>
            <div className="project-list">
              {assignedProjects.map((project) => <article key={project.id}><span className="project-logo" style={{ background: "#009ba8" }}>{project.name.slice(0, 1)}</span><div className="project-name"><strong>{project.name}</strong><small>{project.client_name}</small></div><span className="desktop-status">{project.status.replaceAll("_"," ")}</span><div className="mini-progress"><i style={{ width: `${project.progress}%`, background: "#009ba8" }}/></div><b>{project.progress}%</b><button aria-label={`Open ${project.name}`}>›</button></article>)}
            </div>
          </section>
        </div>
      </main>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
