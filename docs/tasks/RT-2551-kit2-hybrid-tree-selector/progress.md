# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Agreement and checks
- **Done:** both components with their tests; `disabled` on both trees and both selectors — rules SC-UKV-699 and 700 with their tests, 98 tree and selector tests green; overviews, Playground and three matrix cells; 3 references re-taken after a look, the second run 811 of 811; check:all green — 131 projects and stylelint
- **Next step:** show the stories on :6007 and wait for «открывай»
- **Uncommitted:** nothing
- **Waiting for the owner:** the look of the stories on :6007 — the PR opens after «открывай»
- **PR:** not open yet

## Steps

- [x] 1.1 Write the single-group logic with its tests
- [x] 1.2 Open the tree and the selector to heirs without changing them
- [x] 1.3 Write both components with their tests
- [x] 2.1 Write the wrappers, Playground and the matrices
- [x] 2.2 Write the overview pages
- [x] 2.3 Take the snapshots and look at them
- [x] 3.1 Bind the spec rules in the companion and the indexes
- [x] 3.2 Run the full check set
- [>] 3.3 Show the stories to the owner

## Decisions along the way

- **The new components inherit, they do not copy** — `rt-hybrid-tree` extends `RtTreeComponent` and
  takes its template and styles; the tree opens four protected points of the choice. The hybrid
  selector extends `RtTreeSelectorComponent`, and the selector template draws the hybrid tree by
  the `hybrid` flag. Affected stage: 1.

- **The select-all mark stands above the first row's mark, and Clear is outlined and red** — the
  owner after looking at the stories: «Чекбокс Выбратьвсе должен быть над первым чекбоксом списка
  если там есть чекбокс у группы или на шевроном как сечас если чекбокса группы нет». Done in this
  branch, since RT-2550 waits for the same «открывай». Affected stage: 3.

- **Select-all is optional and sticky** — the owner: «Выбрать все должен быть стики и опциональным».
  `selectAll` of the selector is off by default like the buttons of the row. The row sticks to the
  top of the scrolling place, so the tree and the selector got their own surface background.
  Otherwise the sticky row stood as a white strip on the page. Affected stage: 3.

- **Both selectors and both trees get `disabled`** — the owner on the migration of the report
  builder: «в этой задаче добавь чего не хватает». The application's own `disabled` greys only
  select-all and Submit, and its rows stay clickable; the kit switches off the search, the buttons,
  select-all and the rows. Affected stage: 1–3.

## Sessions

### 2026-10-07

- The branch stands on RT-2550, which waits for «открывай»; RT-2550 took the epic branch with
  main merged in, and its 802 snapshots matched after the merge.
