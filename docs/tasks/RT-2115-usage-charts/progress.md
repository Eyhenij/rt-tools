# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — the end-to-end spec of the section
- **Done:** stage 1 — `GET /api/usage/digest`: the contract, the two grouped queries, the zero days, the operation; scenarios `SC-MB-355`…`SC-MB-358` in the spec. Stage 2 — the digest above the table: the chart by day, three bar lists, the quick period; the store reads by tree and period alone; the block `admin-digest` in the styles layer.
- **Next step:** `SC-MB-357` and `SC-MB-358` in `apps/message-bus-admin-e2e/src/usage-section.spec.ts`; the frame `list-usage` re-taken; the full end-to-end run.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Decisions along the way

- **The two tops reuse the paged query with a page of five.** A query of their own would repeat the grouping. Affected stage of the plan: 1.
- **The day in milliseconds lives in the shared contract lib.** Both sides walk the days of the period, and the duplicate check counts a second declaration. Affected stage of the plan: 2.

## Sessions

### 2026-09-15

- The folder written; the branch taken from `RT-2097-rule-usage` after the chain was merged and main merged in.
- Stage 1 done: observations feature 109, util 15, common 36 tests passed; `nx build message-bus` green; lint of four libs green; `check-specs` names no divergence.
- Stage 2 done: admin build green; lint and tests of the usage libs green; stylelint, `check:reuse`, `check:layers`, `check-file-size`, `check-dupes`, `check-specs` green.
