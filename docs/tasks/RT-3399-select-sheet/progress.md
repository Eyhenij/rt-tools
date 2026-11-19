# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 из 4 — Code and unit tests
- **Next step:** the sheet mode in `RtPopoverDirective` (inputs `rtPopoverSheet`, `rtPopoverSheetTitle`;
  on `BreakpointsService.viewportNarrow` it attaches a new `RtPopoverSheetComponent` — `rt-bottom-sheet`
  with the panel template inside — to a global CDK overlay instead of the connected one); then the
  `sheet` input (default `true`) on `rt-select` and `rt-multiselect`, the field pushing its label into
  the control (`setFieldLabel`, the way `setReadonly` goes), the multiselect footer «Готово» in the
  sheet; tests named by SC-UKV-1382…1389. After that the rest of the set by the same input, then
  `rt-menu` (own overlay), the folding `rt-toggle-button-group`, the field with a toggles panel —
  each with its own rules added to the spec.
- **Decision along the way:** the rules live in a new subdomain `docs/specs/ui-kit-v2/popover-sheet/`,
  not in the select spec the plan named: the sheet belongs to the popover directive and serves the
  whole set.

### 1. Mockup

1. [x] Draw the frames of both fields in the sheet at 375 in the kit's Figma file: single choice, multiple choice, with search. — the frames already stand in the file: `Телефон · Select` (6068:811), `Телефон · Select, дерево` (6068:895), `Телефон · Multiselect` (6068:1250), built on `Bottom Sheet` and `Sheet Content / Select…`; all 375×812, search in each, the multiselect sheet has the footer «Выбрано: N · Сбросить · Готово».
2. [ ] Measure the frames by the pattern `mockups-measure`.
3. [x] Show the frames to the owner and write the approval into `approvals.md`. — «это ок».

### Stage revision — 19.11.2026

The owner widened the task: «все в этом тикете делать, везде где можно прикрутить ботомшит вид на
мобилке». The plan stays as written; each of its four stages now covers every component of the
set named in the grill, Decisions. Stage 1 gets the steps below for the components that have no
phone frame yet.

1. [x] Find which components of the set already have a phone frame in Figma. — `rt-select`, `rt-multiselect`, `rt-autocomplete` have them (`Телефон · Autocomplete`, 6068:1387, and its long and empty kinds); the rest have none.
2. [x] Draw the missing phone frames. — each on the page of its component, built from `Bottom Sheet` with a `Sheet Content / …` component swapped in: `Телефон · Menu` 8293:2474, `Телефон · Tabs, «Ещё»` 8292:1058, `Телефон · Tabs, меню вкладки` 8292:1122, `Телефон · Split Button` 8292:1522, `Телефон · Speed Menu` 8292:1756, `Телефон · Dynamic Selector` 8292:2360, `Телефон · Color Palette` 8292:2593; the new select with toggles on the Select page — `Широкий экран · Select с переключателями` 8293:3667 and `Телефон · Select с переключателями` 8293:3691, with the components `Toggle Row` and `Toggle Divider`.
3. [x] Show them to the owner and write the approval into `approvals.md`. — «макеты ок».

### Stage revision — five more places

The owner added them: «Да, все пять».

1. [x] Draw the phone frames of the five places. — `Телефон · Toggle Button Group, один` 8310:652, `…, несколько` 8310:769, `…, помещается` 8310:837; `Телефон · Action Bar` 8310:1013; `Телефон · Thread List, фильтры` 8310:2735; `Телефон · Table Filter Header, условие` 8310:3067; `Телефон · Page Header, действия` 8310:17232, `…, меню пользователя` 8310:17301, `…, подраздел` 8310:17374.
2. [x] Show them to the owner and write the approval into `approvals.md`. — «Одобряю».

Stage 1 is closed: every frame of the set is approved. Stage 2 begins.

### 2. Agreement in the spec

1. [x] Write the rules and scenarios of the sheet and of the input that switches it off into the select spec. — written into the subdomain `popover-sheet`, scenarios SC-UKV-1382…1389.

### 3. Code and unit tests

1. [ ] `rt-select`: the narrow sign, the sheet in the template, the switch-off input, the choice closes the sheet. ← going on
2. [ ] `rt-multiselect`: the same; the sheet stays open on a choice.
3. [ ] Unit tests by the scenarios of stage 2.

### 4. Showcase

1. [ ] Stories of both fields at the narrow width with the sheet open and with the sheet off.
2. [ ] Measure the showcase against the mockup with `node tools/kit-match.mjs numbers`.
3. [ ] Show the showcase to the owner and write the approval into `approvals.md`.

## Decisions along the way

- Every kit component with a drop-down panel goes into this task (grill, Decisions).
