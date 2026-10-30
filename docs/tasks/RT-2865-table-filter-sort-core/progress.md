# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 из 5 — the showcase story and the owner's approval

### Stage 1 — the frame and the owner's approval

- [x] 1. A Figma frame of `rt-data-table`: a list filter set to «Нет», column B pressed after A ascending.
- [x] 2. The frame is measured and shown to the owner with what to look at.
- [x] 3. The owner's answer is written into the grill.

The owner answered that the filter keeps both modes and that an unchanged look needs no frame. The
frame is removed from Figma; the stage closes without an approval, by the owner's word.

### Stage 2 — the core and its tests

- [x] 1. Tests of the present behaviour of both tables pass before the edit.
- [x] 2. `table-core/` holds the filter and the sort with one aria type and the cycle flag.
- [x] 3. `rt-table-core.spec.ts` covers SC-UKV-1104…1108.

Before the edit: 285 suites, 3379 tests green. The core spec: 13 tests, SC-UKV-1104…1107.

### Stage 3 — both tables on the core

- [x] 1. `rt-table` and `rt-data-table` call the core; the four old logic files lose their copies.
- [x] 2. The specs of both tables pass, with the data-table cases for `false` and for column B.
- [x] 3. Typecheck and lint of the kit are green.

The four files keep their exported names as one-line calls of the core, so applications lose
nothing. After the edit: 286 suites, 3392 tests green; typecheck and eslint over the touched files
clean.

### Stage 4 — the showcase story and the owner's approval

- [ ] 1. A story of `rt-data-table` with a list filter holding `false` and two sortable columns. ← now
- [ ] 2. The visual gate: the old frames do not move, the new frame is looked at and taken.
- [ ] 3. The links and what to look at go to the owner; the answer is written into the grill.

### Stage 5 — closing

- [ ] 1. The agreement merges into `table-filter` and `table-full-port`.
- [ ] 2. `pnpm run check:all` is green.
- [ ] 3. The folder is taken apart, the PR opens into the epic branch.

## Stage revision of 30.10

By the owner's answers of 30.10 (the grill) the work changes nothing a person sees. So, against the
plan's wording:

- Stage 2, step 3 covers SC-UKV-1104…1107; SC-UKV-1108 is taken out, its work is RT-3015.
- Stage 3, step 2 checks that `false` still removes a condition in `rt-data-table` and that the
  press on column B asks what it asks now.
- Stage 4, step 1 writes no new story; step 2 confirms that no frame moved; step 3 tells the owner
  the showcase did not change, with the gate's number.

## Decisions along the way

- `rt-data-table` sends a number filter as a string, so `0` there never dropped a condition; the
  drop of `false` and `0` is seen only in a list filter.
- The empty mode and the sort cycle are flags of the core; each table passes its own.
- The data-table sort asks descending after any ascending column, against its own spec: RT-3015,
  in the epic plan.

## Sessions

- 2026-10-30: grill closed, agreement, plan; frame drawn and taken out by the owner's word; stage 2
  begun.
