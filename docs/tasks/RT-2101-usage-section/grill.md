# Grill

Epic RT-2097, task 4 of 4 — the last: the agreement of the receiving side merges into the domain by
this branch. The owner's request and answers stand in the record of RT-2098 in the archive and in
the epic plan; here — what this task adds.

## The owner request

> рализуй модуль аналитики полностью без остновок и вопросок, все примеры я тебе дал, работай автономно врежиме ночной работы

## What the tree already has

- **The agreement of the receiving side** — `docs/specs/message-bus/proposed/rule-usage-stats/`: the section rules, scenarios `SC-MB-348`…`SC-MB-352` for this task.
- **The reading** — `GET /api/usage` and `GET /api/usage/:skill/sessions` under `usage:read`, written by RT-2100.
- **The sample of a section** — `libs/message-bus-admin/summaries/`: six libs `api / data-access / feature/list / feature/details-aside / shell / ui / util`; the list screen on `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`, the store on `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts`, the aside on `RtRouteAsideComponent`.
- **The shared list query** — `libs/message-bus-admin/common/core/util/src/lib/list-query.ts`: page, size, sort, dir, tree, state, version; the address is the source of the selection; `readPage` in the core api lib sends the parameters.
- **The filters of the core ui** — `tree-filter`, `state-filter`, `version-filter` on `rt-select`; the kit has `rt-date-picker` with an ISO string value.
- **The menu** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts`: an item carries its right; the routes of the app — `apps/message-bus-admin/src/app/app.routes.ts`; the labels — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts`.
- **The end-to-end suite** — `apps/message-bus-admin-e2e/`: the stand seeds by the intake operations, `SECTION` marks in `src/support/admin.ts`, screen frames by `expectScreen`, the seed self-check demands time values in the past.

## What the rules already say

- `lists` / `admin-lists-screen` — a section is the common base plus its store, columns and sortable fields; the selection lives in the address.
- `reuse-first` — the ready-made is extended, not cloned: a period filter joins the filters of the core ui, the list query gains the period.
- `entity-models` — two sides of a model, `Api` and `State`, a mapper between them.
- `testing` — a scenario whose "Then" names a person is closed by an end-to-end test; the seed creates what the screen cannot open without.

## Questions and answers

None asked: the session is autonomous, and the owner's answers on the design lie in the agreement.

## Decisions

- **The usage operation answers a page, and the section inherits the list base whole.** The base reads a page with page, size, sort and dir; a list answered whole would need a second base. The receiver pages and sorts the usage by the storage; the default order stays the reading's — loads descending. Nobody to ask: autonomous session. Cost of a mistake: the paging of the operation, one query with an offset.
- **The period joins the shared list query as `from` and `to`, empty when absent.** The other sections send nothing when the period is empty, and their operations do not read it. Cost of a mistake: two fields in one shared type.
- **The default period is the receiver's: the last thirty days when the address names none, and the answer names the period it counted.** One computation, on the side that has the clock of the intake; the filter shows what the answer named. Cost of a mistake: one function.
- **The period filter is two date pickers of the kit, and a change lands in the address when both days are named.** A half-typed period re-reads nothing. Cost of a mistake: one component of the core ui.
- **The kind is shown by a word of the dictionary; a session sign is shown as it is.** The owner said sessions are shown by hash and count.

## What is left unclear

- Whether the sessions panel should page. A skill over a period has hundreds of sessions at most; the list goes whole.
