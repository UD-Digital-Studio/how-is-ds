# How's DS

A lightweight, mobile-first project follow-up portal for owners, the product owner and project manager assigned to each project, and read-only clients.

## V1 scope

- One owner oversees multiple projects.
- Four roles are held per project: owner, product owner, manager and client. A
  user can hold different roles on different projects.
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

Open `http://localhost:3000`. Note that `DATABASE_URL` points at the production
database: there is no separate local or test database, so `npm run dev` and
`npm test` both read and write live data.

## Deployment

The app runs on Vercel, building from `main`, against a PostgreSQL database
(currently Neon). [DEPLOYMENT.md](DEPLOYMENT.md) is the checklist: environment
variables, the domain, the Evolution delivery webhook and the smoke tests.

Migrations are numbered files in `db/`, applied in filename order by
`npm run migrate`; `db/schema.sql` is used only to create a database from
scratch. `npm run build` deliberately does not touch the database, so a change
that adds a migration needs `npm run migrate` run against production as well.

The schema is deliberately plain SQL to keep hosting portable. Project
membership is checked on every server query: roles live per project in
`project_members`, never globally.

## Roadmap CSV imports

See [IMPORT.md](IMPORT.md) for the column and status reference. The template is at `public/templates/project-roadmap-template.csv`. Only milestone title, requirement code/title, and task title are required. Statuses must be uppercase (`UPCOMING`/`ACTIVE`/`BLOCKED`/`DONE` for milestones, `NOT_STARTED`/`IN_PROGRESS`/`BLOCKED`/`DONE` for requirements and tasks); empty cells take the defaults, and requirement and milestone statuses are recomputed from task statuses on import.

## Required deployment variables

See `.env.example`. Keep `SESSION_SECRET` and `EVOLUTION_API_KEY` server-only and never prefix them with `NEXT_PUBLIC_`.
