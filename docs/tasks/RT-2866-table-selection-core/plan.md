# Plan

**Task:** RT-2866 · **Branch:** RT-2866-table-selection-core
**Behaviour:** unchanged — the functions move into the core with their bodies, by the epic plan «RT-2866 поведение не меняет». Подтверждено владельцем: «Логика не видимая (Recommended)».

## Footprint

- **Code:** `projects/ui-kit-v2/src/lib/components/table-core/` (a selection file and its spec),
  `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selection.logic.ts`,
  `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selection.logic.ts`.
- **Specs:** `docs/specs/ui-kit-v2/table-full-port/spec.md` — found by `node tools/specs-for.mjs`.
- **Not done here:** column keys (RT-2867), RT-3015, the look of the tables.

## Stages

### Stage 1 — the selection in the core, with tests

1. `table-core/rt-table-selection.core.ts` holds the eleven functions under core names.
2. `table-core/rt-table-selection.core.spec.ts` checks every function.
3. The data-table and data-list files keep their names as calls of the core.

**Done when:** the kit specs, `typecheck` and eslint over the touched files are green.

### Stage 2 — closing

1. The bindings of `table-full-port` name the core.
2. The visual gate matches every frame; the affected checks are green.
3. The folder is taken apart, the PR opens into the epic branch.

**Done when:** the PR is open with the reviewer.
