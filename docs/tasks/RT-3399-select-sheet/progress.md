# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 из 4 — Code and unit tests
- **Next step:** stage 4, step 1 — look at every sheet story live on the showcase of this branch,
  then the kit-match numbers. Every part of the set has its stories: select 67cc8a6ca, toggle
  group 72499909a, multiselect toggles d6733beb0, autocomplete and menu 8a4e595eb, split button,
  speed menu, palette, action bar db7c7e020, dynamic selector, thread list, table filter header
  00196b2b5, page header, tabs and the multiselect footer in the next commit; `build-storybook`
  over the whole set is green. Not seen live: whether «Ещё» of the tabs is measured before `play`
  clicks it, and `MoreSheet` of the page header takes a 1100 px window, since the header hides its
  nav row at 1080 px and below.
- **Question to the owner:** the showcase on 6007 runs from the RT-3428 working copy; may it be
  stopped and this branch's raised there for the live check? Then the live measurement of the calendar icons, which
  waits for the owner's word on the showcase at 6007 (it runs from the RT-3428 working copy).
  Done: the calendar icon of the date and period fields on the select's line (5e04df474), the
  multiselect with toggles, `look="toggles"` (scenarios
  1456…1460, the kit set 3777 green; code written by a Sonnet subagent by the owner's word
  «планирование и ревью опус, код пишет сонет работай так», reviewed here), the folding
  `rt-toggle-button-group` (scenarios 1452…1455, the kit set 3772 green), `rt-menu` with the «⋯» actions of the page header (scenarios 1446…1449), the menu
  of a tab — a component of its own, not `rt-menu` as the commit cf96bb005 says (scenarios
  1450…1451, the kit set 3768 green), the select, the multiselect with its footer, the autocomplete
  with a search in the sheet, the dynamic selector, the split button, the speed menu, the «more»
  panel of the tabs, the action bar, the colour palette, the thread list filters, the table filter
  header, the profile menu, «more» and submenu of the page header; the kit set is 3762 tests green.
- **Closed:** `rt-tabs` got the `sheet` input for its «more» panel and its tab menu (scenario
  1461) after the split of `rt-tabs.component.ts`: 500 → 441 lines, the close flow went to
  `rt-tabs.close.ts`, the scroll to the chosen tab to `rt-tabs.reveal.ts`; the tabs set 145 green.
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
   edge against the right edge of the field, in both looks. — by the code: the select and the
   multiselect draw a bare 16 px chevron at the field padding; the date field and the period field
   draw an `rt-icon-button` of 32 px, whose own box moves the glyph 8 px further in. The
   autocomplete and the tree selectors have no trailing icon of their own. The live measurement is left.
2. [ ] Draw the aligned date field next to the select in Figma and show it to the owner. — no
   drawing needed: the approved frames already put every trailing icon 17 px from the field's right
   edge (border 1 + padding 16) — `Select` 4645:2745, `Date Picker` 6055:603, `Date Range Picker`
   6055:1284, `Date Time Picker` 6055:1523, `Time Picker` 6055:748. The code diverges from them.
3. [ ] Move the date picker icon, and any other that diverged, onto the select's line; a spec or a
   measurement holds it. — the open button of `rt-date-picker` and `rt-date-range` is pulled out by
   its own property `--rt-<block>-open-offset` = (32 − 16) / −2 = −8 px on every field size, by the
   CSS; the live measurement waits for the showcase on 6007, which now runs from another working
   copy. The clear button keeps 24 px between its glyph and the calendar's, against 16 px at the
   select: closing it would overlap the two buttons' hit areas, so it stays and is named to the owner.

### 4. Showcase

1. [ ] Stories of both fields at the narrow width with the sheet open and with the sheet off. —
   begun with the multiselect with toggles: stories `Toggles` and `TogglesSheet` by the mockups
   8293:3667 and 8293:3691; the select got `Sheet` and `SheetOff` at 375 by the mockup 6068:811
   (67cc8a6ca); the toggle group gets `FoldedOne`, `FoldedMany`, `Fits` and `FoldedOneOpen` by the
   mockups 8310:652, 8310:769 and 8310:837; the autocomplete and `rt-menu` get `Sheet` and
   `SheetOff` by 6068:1387 and 8293:2474; the split button, the speed menu, the colour palette and
   the action bar get the same pair by 8292:1522, 8292:1756, 8292:2593 and 8310:1013; the dynamic
   selector, the thread list filters and the table filter header by 8292:2360, 8310:2735 and
   8310:3067; the page header, the tabs and the multiselect footer by 8310:17232…17374, 8292:1058,
   8292:1122 and 6068:1250. The toggles stories are in (d6733beb0). Every story of the set takes the select's technique: a
   `BreakpointsService` stub narrow from the first render, overlay `.rt-popover-sheet`.
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
- **Next step:** the field with a toggles panel, then the trailing icons. Done: the folding

The progress in full — `docs/tasks/RT-3399-select-sheet/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
153d11d39 feat(rt:ui-kit-v2): группа переключателей сворачивается в поле выбора, когда не помещается (RT-3399)
98bfabd6b feat(rt:ui-kit-v2): меню вкладки на телефоне — в нижней шторке (RT-3399)
cf96bb005 feat(rt:ui-kit-v2): меню действий rt-menu на телефоне — в нижней шторке (RT-3399)
bb98b0b6d feat(rt:ui-kit-v2): меню шапки страницы на телефоне — в нижней шторке (RT-3399)
857f2edf4 feat(rt:ui-kit-v2): нижняя шторка у динамического селектора (RT-3399)
dceae8fde feat(rt:ui-kit-v2): автокомплит на телефоне ищет в нижней шторке (RT-3399)
44c9814e8 feat(rt:ui-kit-v2): нижняя шторка у меню и панелей остального набора (RT-3399)
0d74de272 feat(rt:ui-kit-v2): подвал «Выбрано · Сбросить · Готово» в шторке мультиселекта (RT-3399)
ab78c8832 feat(rt:ui-kit-v2): селект и мультиселект открывают список в нижней шторке на телефоне (RT-3399)
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
