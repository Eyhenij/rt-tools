# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the digest in the section
- **Done:** stage 1 — `GET /api/usage/digest`: the contract, the two grouped queries, the zero days, the operation; scenarios `SC-MB-355`…`SC-MB-358` in the spec.
- **Next step:** the digest model, api, store, ui and the quick period in the section; the block `admin-digest` in the styles layer.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Decisions along the way

- **The two tops reuse the paged query with a page of five.** A query of their own would repeat the grouping. Affected stage of the plan: 1.

## Sessions

### 2026-09-15

- The folder written; the branch taken from `RT-2097-rule-usage` after the chain was merged and main merged in.
- Stage 1 done: observations feature 109, util 15, common 36 tests passed; `nx build message-bus` green; lint of four libs green; `check-specs` names no divergence.
