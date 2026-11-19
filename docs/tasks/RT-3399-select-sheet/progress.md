# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 из 4 — Code and unit tests
- **Next step:** the folding `rt-toggle-button-group`, then the toggles field, then the trailing
  icons. Done: `rt-menu` with the «⋯» actions of the page header and the tab context menu built
  on it (scenarios 1446…1449, the kit set 3766 green), the select, the multiselect with its footer, the autocomplete
  with a search in the sheet, the dynamic selector, the split button, the speed menu, the «more»
  panel of the tabs, the action bar, the colour palette, the thread list filters, the table filter
  header, the profile menu, «more» and submenu of the page header; the kit set is 3762 tests green.
- **Decision along the way:** the old narrow-screen behaviour of the profile menu (on the backdrop
  of the mobile menu, SC-UKV-1080, SC-UKV-1084) now lives with the sheet switched off; those two
  scenarios name that, and the approved mockup 8310:17301 is the phone behaviour.
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

1. [x] `rt-select`: the narrow sign, the sheet in the template, the switch-off input, the choice closes the sheet. — the sheet mode lives in `RtPopoverDirective` (`rt-popover-sheet.helper.ts` opens it), the `sheet` input on the select, the field pushes its label as the title.
2. [x] `rt-multiselect`: the same; the sheet stays open on a choice. — plus the footer «Выбрано: N · Сбросить · Готово» by the mockup 6068:1250, scenarios SC-UKV-1436…1438, the spec 11 of 11.
3. [x] Unit tests by the scenarios of stage 2. — `rt-select-sheet.spec.ts`, 8 of 8; the whole kit set, 3742 tests, green after the stub in `rt-filter-control` got `viewportNarrow`.

### Stage revision — the date picker and the icons

The owner added: «включи в задачу поправить дейт пикер пример селектора», «проверить у всех
селектов и пиркеров иконки на одном и том же месте».

1. [ ] Measure the trailing icon of every select and picker of the kit in the showcase: its right
   edge against the right edge of the field, in both looks.
2. [ ] Draw the aligned date field next to the select in Figma and show it to the owner.
3. [ ] Move the date picker icon, and any other that diverged, onto the select's line; a spec or a
   measurement holds it.

### 4. Showcase

1. [ ] Stories of both fields at the narrow width with the sheet open and with the sheet off.
2. [ ] Measure the showcase against the mockup with `node tools/kit-match.mjs numbers`.
3. [ ] Show the showcase to the owner and write the approval into `approvals.md`.

## Decisions along the way

- The mockup of the multiselect sheet shows a search field, while `rt-multiselect` has no search at
  all, sheet or not. The sheet does not add one: a search is a feature of the multiselect of its
  own; it is named to the owner with the showcase.

- Every kit component with a drop-down panel goes into this task (grill, Decisions).

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-3399-select-sheet

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 из 4 — Code and unit tests
- **Next step:** the sheet mode in `RtPopoverDirective` (inputs `rtPopoverSheet`, `rtPopoverSheetTitle`;

The progress in full — `docs/tasks/RT-3399-select-sheet/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/lib/components/field/rt-field.component.ts
 M projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts
 M projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.html
 M projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.ts
 M projects/ui-kit-v2/src/lib/components/popover/index.ts
 M projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts
 M projects/ui-kit-v2/src/lib/components/select/rt-select.component.html
 M projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts
?? projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.component.html
?? projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.component.scss
?? projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.component.ts
?? projects/ui-kit-v2/src/lib/components/select/rt-select-sheet.spec.ts
```

### Commits over the main branch

```
00eab3c11 docs(rt:ui-kit-v2): спека шторки для панелей выбора на телефоне (RT-3399)
df49d6ffd docs(rt:ui-kit-v2): одобрение макетов пяти добавленных мест (RT-3399)
2175aeef9 docs(rt:ui-kit-v2): макеты шторки для пяти добавленных мест (RT-3399)
56fc99df0 docs(rt:ui-kit-v2): ещё пять мест со шторкой в задаче RT-3399
605ce01a6 docs(rt:ui-kit-v2): одобрение макетов шторки для остальных компонентов (RT-3399)
24afe3d3d docs(rt:ui-kit-v2): макеты шторки для меню, вкладок и остальных компонентов (RT-3399)
46865e19c docs(rt:ui-kit-v2): задача RT-3399 расширена на все компоненты со списком выбора
f7d2e3b95 docs(rt:ui-kit-v2): макет шторки селектов одобрен (RT-3399)
69146ab21 docs(rt:ui-kit-v2): одобрение макета шторки селектов (RT-3399)
75c01c679 docs(rt:ui-kit-v2): макеты шторки селектов найдены в Figma, ждут одобрения (RT-3399)
6d1ea092d docs(rt:ui-kit-v2): папка задачи RT-3399 и назначение копии
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
