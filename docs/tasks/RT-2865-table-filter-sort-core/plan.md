# Plan

**Task:** RT-2865 · **Branch:** RT-2865-table-filter-sort-core
**Draft:** `docs/specs/ui-kit-v2/proposed/table-filter-sort-core/`
**Behaviour:** changes

## Footprint

- **Code:** `projects/ui-kit-v2/src/lib/components/table-core/` (new),
  `projects/ui-kit-v2/src/lib/components/table/rt-table-filter.logic.ts`,
  `projects/ui-kit-v2/src/lib/components/table/rt-table-sort.logic.ts`,
  `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-filter.logic.ts`,
  `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-sort.logic.ts` and their callers.
- **Specs:** `docs/specs/ui-kit-v2/table-filter/spec.md`,
  `docs/specs/ui-kit-v2/table-full-port-filter-row/spec.md`,
  `docs/specs/ui-kit-v2/table-full-port/spec.md` — found by `node tools/specs-for.mjs`.
- **Not done here:** row selection (RT-2866), column keys (RT-2867), the look of the tables.

## Rules of the agreement against the stages

| Rule                                          | Stage | Check                         |
| --------------------------------------------- | ----- | ----------------------------- |
| Both tables compute by the core               | 3     | no copy left: `grep` is empty |
| Only an empty string removes a condition      | 2, 3  | SC-UKV-1104                   |
| A change of the comparison adds the condition | 2     | SC-UKV-1105                   |
| The same value reports nothing                | 2     | SC-UKV-1106                   |
| A press follows the cycle of its table        | 2, 3  | SC-UKV-1107                   |
| A press on another column asks ascending      | 2, 3  | SC-UKV-1108                   |
| Both tables name the sort by the same values  | 2, 3  | the type is one, typecheck    |

## Stages

### Stage 1 — the frame and the owner's approval

1. A Figma frame of `rt-data-table`: a list filter set to «Нет», column B pressed after A ascending.
2. The frame is measured and shown to the owner with what to look at.
3. The owner's answer is written into the grill.

**Done when:** the owner's word about the frame lies in the grill.

### Stage 2 — the core and its tests

1. Tests of the present behaviour of both tables pass before the edit.
2. `table-core/` holds the filter and the sort with one aria type and the cycle flag.
3. `rt-table-core.spec.ts` covers SC-UKV-1104…1108.

**Done when:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=table-core` is green.

### Stage 3 — both tables on the core

1. `rt-table` and `rt-data-table` call the core; the four old logic files lose their copies.
2. The specs of both tables pass, with the data-table cases for `false` and for column B.
3. Typecheck and lint of the kit are green.

**Done when:** the kit specs, `typecheck` and `lint` are green, and the old copies are gone.

### Stage 4 — the showcase story and the owner's approval

1. A story of `rt-data-table` with a list filter holding `false` and two sortable columns.
2. The visual gate: the old frames do not move, the new frame is looked at and taken.
3. The links and what to look at go to the owner; the answer is written into the grill.

**Done when:** the owner's word about the story lies in the grill.

### Stage 5 — closing

1. The agreement merges into `table-filter` and `table-full-port`.
2. `pnpm run check:all` is green.
3. The folder is taken apart, the PR opens into the epic branch.

**Done when:** the PR is open as a draft with the reviewer.
