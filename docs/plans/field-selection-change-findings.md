# Findings of the epic «Кит: событие selectionChange у трёх полей»

They lie here, next to the epic plan `docs/plans/field-selection-change.md`: the task folder died
with the merge, and the owner reads the findings when the epic is over. A line per finding, each
with its address. Each waits for the owner's word; nothing here is applied yet.

## RT-3496 — `selectionChange` at the date range, date and multiselect fields

Loaded over the task: `task-delivery-loop`, `task-flow`, `task-flow-plan`, `task-flow-handover`,
`epic-flow`, `epic-flow-declare`, `git-workflow` with its queue, push and hosting parts,
`doc-style`, `doc-style-human`, `component-structure`, `agent-kit-extend`, `ui-component-tests`,
`rt-tools-storybook`, `browser-verification`, `testing`, `spec-driven`.

- **Work outside an epic deadlocks the task engine.** The measured course has no exit from
  `эпик-заведён` without an epic plan; the code facts count `эпик-заведён` and
  `задачи-эпика-кончились` as unknown states and close the code; the step guard refuses a later
  state written by hand. `task:new --outside-epic` therefore leads nowhere — the second time after
  RT-3390. **Address:** package — `task-flow/measure/epic.mjs` (the exit passes on the card line of
  work outside an epic) and `hooks/facts-flow.sh` (both states join the list of states without
  code). Until then, tree — a section «Work outside an epic» in `task-delivery-loop/GUARDS.md` and a
  caveat at step 2 of `task-delivery-loop/pitfalls.md`: one task on the owner's word becomes an epic of
  one task.
- **The assignment row is written on the owner's word, quoted in it.** The session's permission
  check refused the row as a change of its own authority until the owner said «Впиши сам».
  **Address:** tree — `task-delivery-loop/GUARDS.md`; the question to the owner carries the ready
  row.
- **The engine reads a task's epic from its body line only.** `tools/board.mjs` builds the epic by
  `declaredEpicOf(issue.body)`; a task linked as a sub-issue after its creation stayed outside the
  epic until the line «Задача эпика #3497» was added by hand. **Address:** package —
  `rules/epic-flow.md`, the article about the sub-issue: a task taken into an epic after creation
  gets both the link and the body line; the companion line of `epic-flow/implementation.md` with
  it. Or package code: `taskState` falls back to the sub-issue parent.
- **The end-to-end coverage guard judges the remote head and names the suite only at the PR.** The
  admin draws `rt-date-picker`, so SC-MB-454 was demanded at `gh pr create`; a push in the same
  command left the guard reading the old tip. **Address:** tree — `task-delivery-loop/GUARDS.md`,
  «Opening the PR»: the suite is chosen at the plan by `rt_kit2_reaches`, and the push is a call of
  its own.
- **A `page.goto` timeout of one story reads as a list of orphaned references.** The run ahead
  prints the last 25 lines of a red step — the orphan list, not the timeout; the forwarder of
  `tools/shot-browser.mjs` has no connect timeout. It fell twice in this task, on a different story
  each time, with every frame matching. **Address:** tree — item 6 of «Sorting out a fallen run» in
  `ui-component-tests-visual/pitfalls.md`; package — `hooks/git-guard-push-ahead.sh` prints the
  first failing lines of a red step; tree code — a connect timeout in the forwarder.
- **A field's form path was checked on one binding.** Round one found the `writeValue` fix checked
  only on a reactive form; round two found the `valueChanges` write-back and a regression.
  **Address:** tree — `ui-component-tests/SKILL.md`, «What answers which question»: an edit of
  `writeValue` or of the path to the form is checked on a reactive control, a signal form, a form
  subscriber and an output handler in one spec.
