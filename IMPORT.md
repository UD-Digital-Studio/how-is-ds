# Roadmap CSV import

One CSV populates milestones, functional requirements and tasks for a single
project. Download the working example at
`public/templates/project-roadmap-template.csv`, or from **Import roadmap** in
the app.

Requires OWNER or MANAGER on the target project. Maximum file size 2 MB.
Every row is validated before anything is written, and the whole import runs in
one transaction: if a row fails, nothing is saved.

## Columns

| Column | Required | Notes |
| --- | --- | --- |
| `milestone_title` | yes | Matched against existing milestones case-insensitively; created when absent. |
| `requirement_code` | yes | Unique per project. Reusing a code updates that requirement instead of adding one. |
| `requirement_title` | yes | |
| `task_title` | yes | Skipped when the requirement already has a task with this title (case-insensitive). |
| `milestone_start_date` | no | `YYYY-MM-DD`. |
| `milestone_due_date` | no | `YYYY-MM-DD`. |
| `milestone_status` | no | See statuses below. Defaults to `UPCOMING`. |
| `requirement_description` | no | Kept on re-import when the new value is empty. |
| `requirement_status` | no | Defaults to `NOT_STARTED`. |
| `task_description` | no | |
| `assignee_name` | no | Free text; developers do not have accounts. |
| `task_due_date` | no | `YYYY-MM-DD`. |
| `task_weight` | no | Positive number, defaults to `1`. Weights drive percentage progress. |
| `task_status` | no | Defaults to `NOT_STARTED`. |
| `milestone_code` | no | Present in the template for readability but ignored. Order comes from the order milestones first appear. |

## Status values

Statuses are matched exactly, in uppercase. Surrounding whitespace is trimmed,
but `Done` or `done` is rejected with `Row N: invalid ... status`. An empty cell
is always valid and takes the default.

| Column | Allowed values | Empty means |
| --- | --- | --- |
| `milestone_status` | `UPCOMING` `ACTIVE` `BLOCKED` `DONE` | `UPCOMING` |
| `requirement_status` | `NOT_STARTED` `IN_PROGRESS` `BLOCKED` `DONE` | `NOT_STARTED` |
| `task_status` | `NOT_STARTED` `IN_PROGRESS` `BLOCKED` `DONE` | `NOT_STARTED` |

The two sets differ: milestones use `UPCOMING`/`ACTIVE`, while requirements and
tasks use `NOT_STARTED`/`IN_PROGRESS`. The project statuses (`PLANNING`,
`ON_TRACK`, `AT_RISK`, `PAUSED`, `COMPLETED`) belong to the project record and
have no column in the CSV.

### Only `task_status` really matters

A database trigger (`db/009_progress_triggers.sql`) recomputes requirement and
milestone state from the tasks below them on every task insert, so the values in
`requirement_status` and `milestone_status` are overwritten during the same
import. Set the task statuses correctly and the levels above resolve themselves:

- any task `BLOCKED` → requirement `BLOCKED`
- every task `DONE` → requirement `DONE`
- any task past `NOT_STARTED` → requirement `IN_PROGRESS`
- no tasks at all → requirement `NOT_STARTED`

Milestones then follow their requirements the same way, and milestone progress
becomes the weight-weighted share of tasks marked `DONE`.

## What gets rejected

Validation errors are reported per row, numbered as in a spreadsheet (the header
is row 1), and the first 30 are shown:

- a missing `milestone_title`, `requirement_code`, `requirement_title` or `task_title`
- a status outside the lists above
- a `task_weight` that is zero, negative or not a number
- a file that is not valid CSV, has no data rows, or exceeds 2 MB

Dates are the one thing not pre-validated. An unparseable date reaches
PostgreSQL and rolls the import back with a raw database error rather than a
per-row message, so stick to `YYYY-MM-DD`.

## Re-importing

Re-running the same file is safe and is the intended way to extend a roadmap:
milestones match on title, requirements upsert on `requirement_code`, and tasks
are skipped when the title already exists under that requirement. Two
consequences worth knowing:

- Changing a requirement's `milestone_title` while keeping its code moves that
  requirement to the other milestone.
- Renaming a task creates a second task rather than renaming the first, because
  the title is the identity. Edit task titles in **Manage roadmap** instead.
