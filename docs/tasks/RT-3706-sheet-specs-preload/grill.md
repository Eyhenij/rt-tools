# Grill

Work begun from no cargo: the task came out of the merge of the main branch into the epic RT-3530.

## The owner request

> продолжай работу над основным эпиком

> работай

> RT-3605 вынеси из эпика заведи для нее другой эпик

## What the tree already has

- The merge of the main branch into `RT-3530-phone-sheets` (commit `f64fa65e7`) brought RT-3645: the
  code of the popover sheet is loaded at the first opening, by `rtPreloadPopoverSheet()` or by the
  first `rtOpenPopoverSheet()` call (`projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts`).
- The specs of the main branch that open a sheet wait for its code first:
  `await rtPreloadPopoverSheet()` in `beforeAll`, e.g.
  `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-sheet.spec.ts`.
- Four specs the epic added open a sheet and look into it in the same tick, so after the merge each
  fails one case: `rt-table-filter-header.component.spec.ts` (SC-UKV-1782),
  `rt-dynamic-selector-sheet.spec.ts` (SC-UKV-1780), `rt-multiselect-sheet.spec.ts` (SC-UKV-1795),
  `rt-popover-sheet-templates.spec.ts` (SC-UKV-1753). Measured: 4 failed, 38 passed of 42.
- The epic branch takes no edits of its own: the repair of a merge goes into a task branch from its
  tip (rule `git-workflow`).

## What the rules already say

- `git-workflow`: «A merge needing repairs goes into the epic branch alone, the repairs into the task
  branch from that tip.»
- `task-delivery-loop`: every task, a spec repair too, goes through a live check and review.
- `testing`: a spec is fixed so that it checks the same behaviour, not loosened.

**Tasks of the grill:** 1

## Questions and answers

No question was put to the owner: the cause and the fix are taken from the code of the main branch,
and the behaviour of the kit does not change.

## Decisions

- **The four specs wait for the sheet code the way the main branch specs do** — the same
  `rtPreloadPopoverSheet()` in `beforeAll` keeps every assertion as it is. Rejected: making the
  assertions asynchronous — it changes what the cases check and differs from the main branch.

## What is left unclear

- Nothing blocks the work.
