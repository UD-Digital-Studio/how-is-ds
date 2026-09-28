# How's DS

A lightweight, mobile-first project follow-up portal for owners, assigned PM/PO/assistants, and read-only clients.

## V1 scope

- One owner oversees multiple projects.
- A manager is assigned per project and records outcomes after developer meetings.
- Clients have read-only access only to their assigned projects.
- Meeting updates feed milestones, progress, blockers, and published reports.
- Publishing a report can notify assigned clients through Evolution API/WhatsApp.
- English and French client experiences.

Developers do not have accounts. Client comments, chat, time tracking, invoicing, file-heavy document management, and real-time collaboration are intentionally excluded from v1.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The current dashboard is a polished front-end prototype seeded with the Waklass August–December 2026 roadmap.

## Production foundation

1. Provision any standard PostgreSQL database.
2. Copy `.env.example` to `.env.local` and set the values.
3. Apply `db/schema.sql` to the database.
4. Add server-side session authentication and database queries.
5. Connect the report publishing action to `lib/evolution.ts`.
6. Configure an Evolution API delivery webhook to update `notification_deliveries`.
7. Import the repository into Vercel and attach the domain.

The database schema is deliberately plain SQL to keep hosting portable. Project membership must be checked on every server query: owners can access all projects, managers only assigned projects, and clients only read their assigned projects.

### Roadmap CSV imports

See [IMPORT.md](IMPORT.md) for the column and status reference. The template is at `public/templates/project-roadmap-template.csv`. Only milestone title, requirement code/title, and task title are required. Statuses must be uppercase (`UPCOMING`/`ACTIVE`/`BLOCKED`/`DONE` for milestones, `NOT_STARTED`/`IN_PROGRESS`/`BLOCKED`/`DONE` for requirements and tasks); empty cells take the defaults, and requirement and milestone statuses are recomputed from task statuses on import.

## Required deployment variables

See `.env.example`. Keep `SESSION_SECRET` and `EVOLUTION_API_KEY` server-only and never prefix them with `NEXT_PUBLIC_`.
