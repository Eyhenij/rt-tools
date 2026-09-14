# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 done — the queries and the operations
- **Done:** stage 2 — `usage.queries.ts` (two raw grouped queries, the tree by its sign), `usage-read.controller.ts` with its spec (6 tests), 32 tests green in the feature lib, build and lint green; both queries and the granting migration probed on a one-off database with eight seeded rows — the counts, the order and the owner's rights matched; stage 1 — `usage:read` in the closed set, the migration `20260914210000_grant_usage_read`, the stand seed, `usage-period.util.ts` with its spec (11 tests green in the lib), `check:schema` green.
- **Next step:** mark the scenarios covered and bind the rules; take the folder apart.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no — autonomous session.
- **PR:** not open; nothing leaves during the night.

## Decisions along the way

- **The queries go by their own SQL text.** The storage client's grouping cannot count distinct sessions; the text is probed on a real database by a one-off container, the controller spec checks the bindings handed to it. Affected stage: 2.

## Sessions

### 2026-09-14

- The folder written; the branch taken from `RT-2099-observations-intake`.
- Stage 1 done.
- Stage 2 done; SQL probed by `psql` on the migration container.
