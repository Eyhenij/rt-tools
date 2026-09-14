# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — the stand, the end-to-end spec and the merge of the agreement
- **Done:** stage 1 — the period in the shared list query, `GET /api/usage` as a page; stage 2 — the period filter in the core ui, the seven libs of the section, the menu item, the routes, the labels, the access specs.
- **Next step:** seed observation lines on the stand, write `usage-section.spec.ts`, merge the agreement into `docs/specs/message-bus/usage/`.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no — autonomous session.
- **PR:** not open; nothing leaves during the night.

## Decisions along the way

- **Two scenarios of the receiver added — `SC-MB-353`, `SC-MB-354`.** The default period and the page are promises of the reading, and the section scenarios `SC-MB-348`, `SC-MB-349` name a person; a unit test under their number would promise the end-to-end path it does not walk.
- **The usage page asked extends the page asked whole, tree slug included.** The storage key stands next to it; dropping the slug field would need a second type for one list.
- **The total of the page is a window count in the same query.** A second query for the count would answer about another list.
- **The usage contract moved to the common lib.** `IUsageRow`, `IUsageSessionRow`, `IUsagePage` are read by both sides; the admin model declares its `Api` side as an alias of them, as the rule demands, instead of a hand-written copy.
- **The list store base got a `pageRead` hook.** The usage answer carries the period counted beyond the rows; the hook is the one place a section reads what its page carries beyond rows and total.
- **The period filter shows the period counted when the address names none.** Both days come from the answer, so a single pick of one day already gives a whole pair.

## Sessions

### 2026-09-14

- The folder written; the branch taken from `RT-2100-usage-read`.
- Stage 1 done: the tests of the core util, the core data-access, the core feature, the observations feature and util, the common lib are green; `check:specs`, `check-doc-paths`, `check-glossary` name no divergence.
- Stage 2 done: `nx build message-bus-admin` green; 51 admin projects' tests green; lint of 56 projects green; `check:layers` names one divergence from RT-2099 (a re-export in the observations feature barrel) — fixed on that branch and merged forward.
