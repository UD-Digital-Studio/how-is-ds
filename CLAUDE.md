# Working on How's DS

A project follow-up portal: one owner oversees projects, a manager per project
records outcomes after developer meetings, clients get read-only access to their
own projects and receive published reports over WhatsApp and email.

Next.js 16 App Router, React 19, PostgreSQL through `pg` with plain SQL, `jose`
for sessions, `bcryptjs`, `nodemailer`, Vitest. No ORM, no component library, no
state management library.

## Read this first: the database is production

`DATABASE_URL` in `.env.local` points at the live Neon instance that the deployed
app uses. There is no separate local or test database. That means:

- `npm run dev` reads and writes production data.
- `npm test` does too — `vitest.config.ts` calls `loadEnv` and copies `.env.local`
  into `process.env`.
- `npm run migrate` applies migrations to production.

So never truncate, reseed, or bulk-update to try something out. To check
destructive SQL, either wrap it in `begin` / `rollback`, or create a throwaway
row, act on it, and delete it. Verify the real data is untouched afterwards and
say so. `.env.local` holds live secrets: do not print, commit, or send them
anywhere.

## Commands

```bash
npm run dev        # local server on :3000
npm run verify     # npm test && npm run build — run before committing
npm run migrate    # apply db/NNN_*.sql that have not run yet
npm run check:env  # confirm required environment variables are set
```

## Code style

Modules are written dense: one long line per statement group, imports packed
onto the first line, no spaces around `=` or after `,` in the terse files.
Some files (`components/dashboard.tsx`, `app/layout.tsx`, `lib/notification-delivery.ts`)
are conventionally formatted. Match whichever style the file you are editing
already uses instead of reformatting it — a reformat buries the actual change in
diff noise.

SQL is inline and always parameterized (`$1`), never string-interpolated.
Server components query `db` directly; there is no data access layer to go
through. `lib/data.ts` is leftover mock data from the prototype and is not used
by any page.

## Layout

- `app/<route>/page.tsx` — server component, fetches its own data.
- `app/<route>/actions.ts` — `"use server"` actions for that route, colocated.
- `components/` — shared client components.
- `lib/` — `auth`, `db`, `access`, `i18n`, `translations`, `evolution`,
  `evolution-status`, `notification-delivery`, `phone`, `rate-limit`.
- `db/` — `schema.sql` plus numbered migrations.
- `scripts/` — `migrate.mjs`, `init-db.mjs`, `check-env.mjs`, seeds.

## Sessions

`getSession()` (`lib/auth.ts`) verifies the `hows_ds_session` JWT, then re-reads
the user row on every call. A session dies when `users.session_version` no longer
matches the token or `is_active` goes false — bump `session_version` to force a
user off every device. `mustChange` sends the user to `/change-password`.

## Authorization

Four roles live per project in `project_members`: `OWNER`, `PRODUCT_OWNER`,
`MANAGER`, `CLIENT`. A user can hold different roles on different projects, so
every query must scope by membership — check the role for *that* project, never
a global role.

- OWNER — everything. Alone in destroying: deleting a project, removing a
  member, and creating a project (which grants an OWNER membership).
- PRODUCT_OWNER — shapes the work: roadmap structure, task CRUD, CSV imports,
  project settings, People, client notification preferences. None of the deletes
  above.
- MANAGER — moves the work and speaks to the client: task status, blockers and
  notes, meeting updates, reports and their notifications. No structure, no
  imports, no settings, no People.
- CLIENT — read-only, and only `PUBLISHED` reports.

Use the tier helpers in `lib/access.ts` rather than inlining role lists:
`canAdminister` (OWNER + PRODUCT_OWNER), `canReport` (those two + MANAGER),
`isProjectOwner`. `project_members.title` carries the two internal labels,
"Product Owner" and "Project Manager", and the People forms derive the role from
it — but nothing else may read it: authorize on `role`, never on `title`.
Watch for role checks written with dollar-quoted literals
(`role in ($role$OWNER$role$,…)` in `app/notifications/page.tsx`) — a plain grep
for `'OWNER'` misses them.

`users.can_own_projects` holds the right to create a project at the workspace
level, because ownership itself is only granted through `project_members`: an
owner who deleted their last project would otherwise have no membership to
qualify with. Use `canOwnProjects()` from `lib/access.ts` for "may create a
project", and a direct `project_members` check for anything about a specific
project.

Two conventions for failure in server actions, both already used: throw an
`Error` for manager-level tools where an error page is acceptable, and return
`{error}` through `useActionState` for anything a user fills in.

`app/layout.tsx` collapses the user's roles into one label for the navigation.
That is a display simplification — never authorize against it, and put
per-project affordances on pages that know which project they mean.

## Database

Plain SQL on purpose, to keep hosting portable. Migrations are `db/NNN_name.sql`,
applied in filename order by `scripts/migrate.mjs` and recorded in
`schema_migrations`. Never edit a migration that has already run — add the next
number. `schema.sql` is applied only when the `users` table does not exist yet.

Derived state belongs to the database, not the app. `db/009_progress_triggers.sql`
recomputes requirement status plus milestone status and progress from task rows
on every task insert, update and delete, so application code must not write
`requirements.status`, `milestones.status` or `milestones.progress`.

Everything under a project cascades from `projects`: members, milestones,
requirements, tasks, meeting updates, reports and notification deliveries.
`deleteProject` still removes tasks and deliveries explicitly first, to keep the
work off the cascade path and the trigger churn down.

## French is a client-side text swap

There is no message catalogue with keys. `components/translation-layer.tsx`
walks the DOM text nodes and replaces each trimmed English string with the value
from `lib/translations.ts`. Consequences when adding UI:

- Every new user-facing English string needs an entry in `lib/translations.ts`,
  or it stays English for French users.
- A sentence broken up by markup arrives as separate text nodes, so translate
  the fragments (`"Type"`, `"to confirm"`), not the assembled sentence.
- The dictionary is keyed on the exact English text, so rewording a string
  silently orphans its translation.

## Notifications

Publishing a report queues rows in `notification_deliveries`.
`lib/notification-delivery.ts` sends each one by channel — WhatsApp through the
Evolution API (`lib/evolution.ts`) or email through SMTP. The Evolution instance
posts status events back to `/api/webhooks/evolution`, authenticated with the
`x-webhook-secret` header, and `lib/evolution-status.ts` maps the provider's
wording onto `SENT` / `DELIVERED` / `READ` / `FAILED`.

## Tests

`tests/` runs on Vitest against the live database. `tests/database.test.ts`
asserts invariants over real seeded rows, including the Waklass project's name,
so renaming or removing that data makes it fail — update the assertion when the
data legitimately changes.

## Deploying

Vercel builds from `main`, region `cdg1`, so a push deploys. `npm run build`
deliberately does not touch the database: when a change adds a numbered
migration, run `npm run migrate` against production as well. `DEPLOYMENT.md` has
the full checklist including the domain, webhook and smoke tests.

## Time-wasters worth knowing

- `next dev` rewrites `next-env.d.ts` to point at `.next/dev/types` while
  `next build` points it at `.next/types`. Restore it before committing.
- `next dev` also re-adds the `nextjs-agent-rules` block at the end of this file
  (and writes `AGENTS.md` instead when there is no `CLAUDE.md`). Keep it
  committed; deleting it only recreates the change on the next dev run.
- Do not re-run `scripts/init-db.mjs` to fix seeded accounts. It upserts on
  email, so a corrected address creates a *second* owner instead of renaming the
  first, and it looks for a project named `Waklass SMS`, which no longer exists,
  so it would insert a duplicate project too.
- `components/modal-forms.tsx` returns `null` on purpose. Read its comment
  before "fixing" it: moving server-action forms after hydration crashed React
  reconciliation.
- `*.Zone.Identifier` files are WSL download artifacts and are gitignored.
- README's "Production foundation" steps describe work finished long ago. Trust
  the code, `DEPLOYMENT.md` and `IMPORT.md` over that section.

## Docs

- `README.md` — product scope and v1 boundaries.
- `DEPLOYMENT.md` — production deployment and smoke tests.
- `IMPORT.md` — roadmap CSV columns, status values and re-import behaviour.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
