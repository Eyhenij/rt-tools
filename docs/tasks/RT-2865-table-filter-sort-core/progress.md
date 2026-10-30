# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 из 5 — the frame and the owner's approval

### Stage 1 — the frame and the owner's approval

- [ ] 1. A Figma frame of `rt-data-table`: a list filter set to «Нет», column B pressed after A ascending. ← now
- [ ] 2. The frame is measured and shown to the owner with what to look at.
- [ ] 3. The owner's answer is written into the grill.

### Stage 2 — the core and its tests

- [ ] 1. Tests of the present behaviour of both tables pass before the edit.
- [ ] 2. `table-core/` holds the filter and the sort with one aria type and the cycle flag.
- [ ] 3. `rt-table-core.spec.ts` covers SC-UKV-1104…1108.

### Stage 3 — both tables on the core

- [ ] 1. `rt-table` and `rt-data-table` call the core; the four old logic files lose their copies.
- [ ] 2. The specs of both tables pass, with the data-table cases for `false` and for column B.
- [ ] 3. Typecheck and lint of the kit are green.

### Stage 4 — the showcase story and the owner's approval

- [ ] 1. A story of `rt-data-table` with a list filter holding `false` and two sortable columns.
- [ ] 2. The visual gate: the old frames do not move, the new frame is looked at and taken.
- [ ] 3. The links and what to look at go to the owner; the answer is written into the grill.

### Stage 5 — closing

- [ ] 1. The agreement merges into `table-filter` and `table-full-port`.
- [ ] 2. `pnpm run check:all` is green.
- [ ] 3. The folder is taken apart, the PR opens into the epic branch.

## Decisions along the way

- `rt-data-table` sends a number filter as a string, so `0` there never dropped a condition; the
  drop of `false` and `0` is seen only in a list filter.
- The data-table sort asked descending after any ascending column, against its own spec; the core
  follows the spec (SC-UKV-1108).

## Sessions

- 2026-10-30: grill closed, agreement, plan; stage 1 begun.
