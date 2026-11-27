# Grill

## The owner request

> продолжай

Before it, on the epic: «продолжай работу над основным эпиком». The answer of 26.11 to the question about the epic after PR #3711 was merged: the merged tasks of the epic
are marked by the branch of the next task, and none was taken.

## What the tree already has

- `docs/plans/phone-sheets.md` marks RT-3531, RT-3617 and RT-3532 «влита»; the engine reads only «влито»
  (`tools/task-flow/measure/epic-text.mjs:21`), so the exit 12 of the epic stays unmet.
- RT-3706 and RT-3709 merged into the epic by PR #3711 have no rows in the plan.
- The archive record `docs/archive/RT-3709-sheet-code-lazy-weight.md` in the epic branch lacks the line on the
  check of step 3.2 replaced by the owner's «Да, замени и открывай»: it stayed in an unpushed commit of the branch
  RT-3709.

## What the rules already say

The epic branch carries no edits of its own; a mark goes by the branch of the next task (`task-flow`, state
`влито`). A plan text edit has no visible kit change, so no approval of a look is asked.

**Tasks of the grill:** 1

## Questions and answers

**Что делать дальше после слияния #3711?**
продолжай

## Decisions

- **Marks and rows by one task of the epic** — the marks are text of the plan, the archive line is one file;
  rejected: a second PR from the merged branch RT-3709 — the push guard refuses a branch whose PR is merged.

## What is left unclear

- Nothing blocks the work.
