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
- **Live walk on 6017 (20.11):** every `Sheet` story of the set opens the bottom sheet at 375, the
  panel 0…375 wide, no node past its edges (select, multiselect and its toggles, autocomplete,
  action bar, palette, dynamic selector, menu, speed menu, split button, tabs «Ещё» and tab menu,
  page header user menu and submenu, table filter header, thread list); the page header
  `MoreSheet` at 1100 opens the sheet 0…1100. Every `SheetOff` opens no sheet and a panel by its
  trigger, except the autocomplete: its click opens nothing (`openOnFocus` is off), so its story
  types «М» now — measured after: the panel 32…375 by the field, 6 rows, no sheet.
  The quick ranges of the period sheet wrap: the row 335×112, three lines 40 px apart, the widest
  chip ends at 393 inside the row's 396 — the mockup 8371-1292 is 335×112. The locked column's
  handle: opacity 0.5, cursor default, disabled; the other rows 1 and grab; all handles at x 21.
- **Earlier, «стопни стенд»:** the first walk stopped before its first result. Measured live before
  the stop: the calendar glyph of `rt-date-picker` and `rt-date-range` stands 17.0 px from the
  field's right edge on every size (34, 40, 48, 56 px), the same as the select's chevron (17.0 px)
  and the mockups. Then the live measurement of the calendar icons, which
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
2. [x] Measure the frames by the pattern `mockups-measure`. — all 22 frames of the task read by
   node bounds: none overlaps another frame on its page, no node lies outside its frame, and the
   buttons of every horizontal row share one centre. The overlaps the call found on the pages Tabs,
   Thread List and Page Header are between frames older than this task, not named by its plan.
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

1. [x] Measure the trailing icon of every select and picker of the kit in the showcase: its right
   edge against the right edge of the field, in both looks. — by the code: the select and the
   multiselect draw a bare 16 px chevron at the field padding; the date field and the period field
   draw an `rt-icon-button` of 32 px, whose own box moves the glyph 8 px further in. The
   autocomplete and the tree selectors have no trailing icon of their own. Measured live on 6017:
   17.0 px for the select, the date and the period field on every size.
2. [x] Draw the aligned date field next to the select in Figma and show it to the owner. — no
   drawing needed: the approved frames already put every trailing icon 17 px from the field's right
   edge (border 1 + padding 16) — `Select` 4645:2745, `Date Picker` 6055:603, `Date Range Picker`
   6055:1284, `Date Time Picker` 6055:1523, `Time Picker` 6055:748. The code diverged from them;
   after 5e04df474 the showcase measures 17.0 px for all three fields on every size.
3. [x] Move the date picker icon, and any other that diverged, onto the select's line; a spec or a
   measurement holds it. — the open button of `rt-date-picker` and `rt-date-range` is pulled out by
   its own property `--rt-<block>-open-offset` = (32 − 16) / −2 = −8 px on every field size, by the
   CSS; the live measurement waits for the showcase on 6007, which now runs from another working
   copy. The clear button keeps 24 px between its glyph and the calendar's, against 16 px at the
   select: closing it would overlap the two buttons' hit areas, so it stays and is named to the owner.

### Stage revision — the quick ranges of the period field in the sheet

The owner added, with a screenshot: «добавь в тикет». The row of quick ranges in the bottom sheet of
`rt-date-range` scrolls sideways with a hidden scrollbar, and its last chip is cut by the sheet's
edge with nothing to say the row goes on.

1. [x] Draw the fix in Figma next to `Телефон · Период` 6063:1151 — two variants: the row fades at
   the edge that has more chips, or the chips wrap onto lines — and ask the owner which. — drawn:
   variant A 8371:978 (the row runs from the column's left edge to the sheet's right edge, the
   next chip peeks under a 56 px fade to the sheet surface), variant B 8371:1292 (six chips wrap
   onto three lines, the row 112 px tall instead of 32). The approved frame 6063:1151 itself clips
   the row at 335 px, the same cut as in the owner's screenshot. Asked the owner which. — the
   owner chose «Б — перенос»; the approval is in `approvals.md`.
2. [x] Do the chosen variant; a spec or a measurement at 375 holds it. — measured live 20.11: row 335×112, as the mockup. — done by the CSS: the sheet row wraps (`flex-flow: row wrap`, gap 8 px both ways), the
   sideways scroll is gone; the date-range set 32 green. The measurement at 375 waits for the
   showcase, stopped by the owner («стопни стенд»).

### Stage revision — the drag handle of a locked column

The owner added: «включи в задачу не прятать иконку драга а дизеблить». In the column settings of
`rt-table` a locked row draws an empty placeholder where the others have the drag handle.

1. [x] Draw the locked row with a disabled drag handle in Figma next to the table settings frame and
   ask the owner to approve it. — drawn after «продолжай работу»: node 8405:752 on the Table page,
   the row «Даты» locked, the handle and the eye at opacity 0.5 (`--rt-icon-button-disabled-opacity`);
   no overlap with the neighbouring frames by node bounds. Approved: «Одобряю» (approvals.md).
2. [x] Draw the handle disabled in `table/settings-panel`; a spec holds it. — one handle button for
   every row, disabled with the modifier `--disabled` on a locked one (opacity from
   `--rt-icon-button-disabled-opacity`); the panel spec 6 green, stylelint and eslint clean. The
   look at 0.5 is measured with the showcase walk.

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
- **Next step:** stage 4, step 1 — look at every sheet story live on the showcase of this branch,

The progress in full — `docs/tasks/RT-3399-select-sheet/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
7a4027a9d docs(rt:ui-kit-v2): ручка закреплённой колонки ждёт слова владельца (RT-3399)
eab0102a6 docs(rt:ui-kit-v2): ручка перетаскивания закреплённой колонки — в задаче RT-3399
19092052f fix(rt:ui-kit-v2): быстрые периоды в шторке поля периода переносятся на строки (RT-3399)
4b6db4799 docs(rt:ui-kit-v2): владелец выбрал перенос быстрых периодов в шторке периода (RT-3399)
3c61b1e39 docs(rt:ui-kit-v2): два варианта быстрых периодов в шторке периода нарисованы (RT-3399)
8e5da365e docs(rt:ui-kit-v2): быстрые периоды в шторке поля периода — в задаче RT-3399
701a3b419 docs(rt:ui-kit-v2): замер телефонных макетов шторки по узлам (RT-3399)
a96428cc5 test(rt:ui-kit-v2): истории шапки страницы, вкладок и подвала мультиселекта на телефоне (RT-3399)
00196b2b5 test(rt:ui-kit-v2): истории динамического селектора, фильтров ленты и фильтра таблицы на телефоне (RT-3399)
db7c7e020 test(rt:ui-kit-v2): истории кнопки с меню, быстрого меню, палитры и панели действий на телефоне (RT-3399)
8a4e595eb test(rt:ui-kit-v2): истории автокомплита и меню действий на телефоне (RT-3399)
d6733beb0 test(rt:ui-kit-v2): истории мультиселекта с переключателями (RT-3399)
72499909a test(rt:ui-kit-v2): истории свёрнутой группы переключателей на телефоне (RT-3399)
67cc8a6ca test(rt:ui-kit-v2): истории селекта на телефоне — список в шторке и шторка выключена (RT-3399)
61d155ee1 feat(rt:ui-kit-v2): вкладки выключают шторку для «Ещё» и меню вкладки входом sheet (RT-3399)
545a760b0 docs(rt:ui-kit-v2): входы шторки sheet и fold на страницах витрины (RT-3399)
5e04df474 fix(rt:ui-kit-v2): значок календаря у полей даты и периода — на линии шеврона селекта (RT-3399)
93ad24a73 feat(rt:ui-kit-v2): мультиселект с переключателями — вид look="toggles" (RT-3399)
153d11d39 feat(rt:ui-kit-v2): группа переключателей сворачивается в поле выбора, когда не помещается (RT-3399)
98bfabd6b feat(rt:ui-kit-v2): меню вкладки на телефоне — в нижней шторке (RT-3399)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
