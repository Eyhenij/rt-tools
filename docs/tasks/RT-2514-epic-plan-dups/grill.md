# Grill

## The owner request

> Делай RT-2514

Said after the executor reported that the task table of the RT-2472 epic plan reached main with
repeated rows, left by the keep-both resolution of merge conflicts.

## What the tree already has

- `docs/plans/kit2-migration-gaps.md` — the task table holds 24 rows for 10 tasks; repeats carry
  stale states «PR открыт» and «впереди», while all ten tasks are merged and the epic is closed.
- `node tools/epic-table.mjs 2472` prints the table as it stands, repeats included.

## What the rules already say

- `archive-record` and `task-flow`: a closed epic plan stays in the tree; it is read by the next
  reader, so its table must say what happened.

## Questions and answers

**Чинить RT-2514**
Делай RT-2514

## Decisions

- Question closed by assumption: one row per task, all ten «влит»; the rest of the plan is checked
  for the same repeats.

## What is left unclear

- Nothing.
