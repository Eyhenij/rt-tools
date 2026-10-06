# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Agreement and checks
- **Done:** component, showcase stories and overview; selector tests 17 of 17; 6 snapshots taken, looked at and confirmed by a second raising (801 of 801); check:all green — 131 projects and stylelint
- **Next step:** show the stories on :6007 and wait for «открывай»
- **Uncommitted:** nothing
- **Waiting for the owner:** the look of the reworked controls on :6007 — the PR opens after «открывай»
- **PR:** not open yet

## Steps

- [x] 1.1 Write the search and draft logic with its tests
- [x] 1.2 Write the component with its tests
- [x] 1.3 Add the kit labels in eight languages
- [x] 2.1 Write the wrapper, Playground and the matrices
- [x] 2.2 Write the overview page
- [x] 2.3 Take the snapshots and look at them
- [x] 3.1 Bind the spec rules in the companion and the indexes
- [x] 3.2 Run the full check set
- [>] 3.3 Show the stories to the owner

## Decisions along the way

- **The branch is renamed to `RT-2550-kit2-tree-selector`** — the owner turned the task from a
  `rt-multiselect` mode into a port. Affected stage: all.

- **Labels in English and the showcase Russian, not eight languages** — the kit carries one English
  set and the application gives its language through the translator; the multi toggle, its hint and
  the search placeholder reuse the labels of the dynamic selector. Affected stage: 1.

- **Control buttons are icon buttons, and each is optional** — the owner on the shown stories:
  «развернуть свернуть нужно опционально только иконочные кнопки с соответвующими иконками» and
  «очистить тоже иконко иусорки + откатить выбор кнопка опциональная». Expand and collapse are
  asked for by `expandControls`, clear has a trash can, revert is asked for by `revertable` and
  stands in the confirming form alone. The kit got the icons `expand-all` and `collapse-all` in
  both sets and a Material pair for `undo`. Scenarios SC-UKV-689 and SC-UKV-690. Affected stage: 1–3.

## Sessions

### 2026-10-06

- The branch stands on RT-2584: the epic branch does not carry main until #2585 merges.
- The first full snapshot run failed three dot-field smoke tests with «Story Store before the index is ready»; the second run passed 214 of 214 suites without edits — a runner race, not the branch.
