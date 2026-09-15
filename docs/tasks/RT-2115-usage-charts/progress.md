# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — done
- **Done:** stage 1 — `GET /api/usage/digest`: the contract, the two grouped queries, the zero days, the operation; scenarios `SC-MB-355`…`SC-MB-358` in the spec. Stage 2 — the digest above the table: the chart by day, three bar lists, the quick period; the store reads by tree and period alone; the block `admin-digest` in the styles layer. Stage 3 — `SC-MB-357` and `SC-MB-358` in the end-to-end spec of the section, the frame `list-usage` re-taken; a skill without loads left the top list.
- **Next step:** the full suite, the archive record, the PR into the epic branch.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Decisions along the way

- **The two tops reuse the paged query with a page of five.** A query of their own would repeat the grouping. Affected stage of the plan: 1.
- **The day in milliseconds lives in the shared contract lib.** Both sides walk the days of the period, and the duplicate check counts a second declaration. Affected stage of the plan: 2.
- **The top list is filtered of zero loads the same as the refusal list of zero refusals.** The stand showed a skill with one refusal and no load in «Топ скилов». Affected stage of the plan: 1 and 3.

## Sessions

### 2026-09-15

- The folder written; the branch taken from `RT-2097-rule-usage` after the chain was merged and main merged in.
- Stage 1 done: observations feature 109, util 15, common 36 tests passed; `nx build message-bus` green; lint of four libs green; `check-specs` names no divergence.
- Stage 3 done: the usage spec — 6 passed with the frame re-taken; the receiver feature lint and tests green.
- Stage 2 done: admin build green; lint and tests of the usage libs green; stylelint, `check:reuse`, `check:layers`, `check-file-size`, `check-dupes`, `check-specs` green.
