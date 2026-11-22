# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — texts and the built declarations, done
- **Done:** all five steps matched; the kit's unit tests 4126 of 4126 green; the build carries the
  event in the three declarations
- **Next step:** the live check in the showcase, then two review rounds
- **Uncommitted:** none after the stage commit
- **PR:** not open yet

## Steps

- [x] 1.1 Emit `selectionChange` from the date range field on a pick, typing and the cross
- [x] 1.2 Emit `selectionChange` from the multiselect on a pick, a removed chip and the cross
- [x] 1.3 Emit `selectionChange` from the date picker on a pick, typing and the cross
- [x] 2.1 Name the event in the «Выходы» tables of the three fields
- [x] 2.2 Check the built declarations of the three fields

## Decisions along the way

- **The task goes under the epic RT-3497 of one task** — the engine has no path for work outside an
  epic, and code stays closed without one. The owner's word: «Да, эпик под RT-3496». The task PR
  goes into the epic branch, then the epic PR into `main`. Affected stage: none.
- **On the cross the event carries the field's value after `super.clear()`, behind an
  `isDisabled()` guard** — the empty value of the date field is `''` and of the multiselect `[]`,
  so a constant `null` as in `rt-select` would differ from what the form gets. Affected stage: 1.
- **The two date fields get a signal form case** — the owner's reason is a signal form model fed
  from a store, so the spec sets that model from outside and expects no event. Affected stage: 1.
- **The version is raised by the publish workflow with `minor`** — the workflow bumps it itself,
  a bump in the PR would make it twice. Affected stage: none.
- **The merge and the release follow the PR** — the owner's word «затем выпусти кит»; the merge
  needs the owner's word about this PR. Affected stage: none.

## Sessions

### 22.11.2026

- The plan approved by the owner («Одобряю план RT-3496»); `plan-red` showed all five checks red.
- The epic RT-3497 declared for this one task; its branch is pushed, the task card is its sub-issue.
