# The usage of the rules in the sessions — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

## The intake

- **The observation cargo is taken in by an operation of its own, by the tree token.** — `libs/message-bus-api/observations/feature/src/lib/observations-intake.controller.ts:ObservationsIntakeController` — under `@TreeOperation()`
- **A line lands as a row of its own, as it arrived.** — `libs/message-bus-api/observations/data-access/src/lib/observation.queries.ts:replaceObservationDays` — a row per line
- **A day of one working copy is replaced whole.** — `libs/message-bus-api/observations/data-access/src/lib/observation.queries.ts:replaceObservationDays` — delete by "tree — origin — day" and insert in one transaction
- **A day of another working copy of the same tree is not touched.** — `libs/message-bus-api/observations/data-access/src/lib/observation.queries.ts:replaceObservationDays` — the key of the delete carries the origin
- **A line of an unknown event kind or without a session sign refuses the cargo whole.** — `libs/message-bus-api/observations/util/src/lib/observation-cargo.util.ts:parseObservationsCargo` — the events from the sending side's list, the session sign among the mandatory fields
- **A field of a line longer than its cap refuses the cargo, it is not trimmed.** — `libs/message-bus-api/observations/util/src/lib/observation.const.ts:OBSERVATION_FIELD_BYTES`
- **A cargo with more lines than the cap is refused without a row.** — `libs/message-bus-api/observations/util/src/lib/observation.const.ts:observationLinesCap` — the setting `OBSERVATION_LINES_CAP`, named in the startup line of `apps/message-bus/src/main.ts`
- **A row is kept a year from the day of the line, and older rows are removed by the cleaning of the intake every night.** — `libs/message-bus-api/observations/feature/src/lib/observation-retention.service.ts:ObservationRetentionService`. The moment — `libs/message-bus-api/observations/util/src/lib/observation-retention.util.ts:nextSweepAt`, the term `OBSERVATION_KEEP_DAYS`
- **The digest of a month stays as it was.** — `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.ts:SummaryIntakeController` — untouched by the lines

## The reading

- **The usage is counted by the storage, not by the rows in memory.** — `libs/message-bus-api/observations/data-access/src/lib/usage.queries.ts:readUsage` — a grouped query of the storage by its own text
- **The usage of a skill counts three numbers: the loads, the sessions with a load, the refusals of the gate.** — `libs/message-bus-api/observations/data-access/src/lib/usage.queries.ts:readUsage` — the count, the distinct session signs and the count of the gate rows. A skill with refusals alone is a rule
- **The usage answers a page, and the order is one of the sortable fields, loads descending by default.** — `libs/message-bus-api/observations/data-access/src/lib/usage.queries.ts:readUsage` — the page and the order of the query. The fields — `libs/message-bus-common/src/lib/sortable.ts:USAGE_SORTABLE`. A foreign field is refused by `pageFault` in `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts:UsageReadController`
- **A period the request did not name is the last thirty days of the receiver, and the answer names it.** — `libs/message-bus-api/observations/util/src/lib/usage-period.util.ts:defaultUsagePeriod` — pure, the moment is a parameter. The substitution — `libs/message-bus-api/observations/util/src/lib/usage-period.util.ts:usagePeriodOf`. The answer — `libs/message-bus-common/src/lib/usage.ts:IUsagePage`
- **The period is at most four hundred days, and a longer one is refused.** — `libs/message-bus-api/observations/util/src/lib/usage-period.util.ts:usagePeriodFault` — pure, checked by a call; the limit `USAGE_PERIOD_MAX_DAYS`
- **The sessions of a skill are read by a request of their own: the day, the session sign and how many times the session loaded the skill, newest day first.** — `libs/message-bus-api/observations/data-access/src/lib/usage.queries.ts:readUsageSessions` and `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts:UsageReadController`
- **The reading is closed by the right `usage:read`.** — `libs/message-bus-common/src/lib/rights.ts:TRight` — the right in the closed set. `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts:UsageReadController` names it at both operations. `prisma/migrations/20260914210000_grant_usage_read/migration.sql:rights` gives it to the owner role
- **An empty period answers with an empty page, not a refusal.** — `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts:UsageReadController` — an empty answer of the query goes as it is

## The section

- **The section is a list page of the admin application, on the common base.** — `libs/message-bus-admin/usage/feature/list/src/lib/admin-usage-list.component.ts:AdminUsageListComponent`. It inherits `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:AdminListScreenBase` and names itself the host of the shared page
- **The filters are the tree and the period, and a change of either re-reads the table.** — `libs/message-bus-admin/common/core/ui/src/lib/period-filter/admin-period-filter.component.ts:AdminPeriodFilterComponent` — two day pickers of the kit. The period goes into the address by `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:changePeriod`, and the reading follows the address. The period counted — `libs/message-bus-admin/usage/data-access/src/lib/usage-rows.store.ts:period`, shown when the address names none
- **A row of the table shows the skill, its kind, the loads, the sessions and the refusals.** — `libs/message-bus-admin/usage/util/src/lib/usage.columns.ts:USAGE_COLUMNS` — the columns; `libs/message-bus-admin/usage/util/src/lib/usage.columns.ts:skillKindLabel` — the kind by the word of the dictionary
- **A row opens the panel of the sessions of its skill.** — `libs/message-bus-admin/usage/feature/sessions-aside/src/lib/admin-usage-sessions-aside.component.ts:AdminUsageSessionsAsideComponent` — on the aside base of the kit. The route `usage/:skill` in the outlet `ro` — `libs/message-bus-admin/usage/shell/src/lib/usage.routes.ts:usageRoutes`
- **While the table re-reads, the former rows stay dimmed under the sign of reading.** — `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:read` — the rows of the former selection stay until the answer, the busyness is a sign of its own
- **An empty period draws the empty state of the base, not a text of its own.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:emptyMessage` — the empty state is an input of the kit table, and the section has no empty text of its own
- **A failure of the reading is one message of the shared list page for the section.** — `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:fault` — the refusal is the state of the store, and the shared page draws it once above the table
- **The labels of the section, the columns, the kinds and the panel lie in the dictionary of the application.** — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS` — the keys `sectionUsage`, `hintUsage`, `columnSkill`…`columnDenials`, `kindRule`…`kindOwn`, `detailsUsageSessions`
- **The numbers of the section are checked against the print of the digest at the tree.** — `apps/message-bus-admin-e2e/src/usage-section.spec.ts` — the stand seeds the lines by the intake in `apps/message-bus-admin-e2e/stand/seed.mjs:observations`, the spec reads the table
