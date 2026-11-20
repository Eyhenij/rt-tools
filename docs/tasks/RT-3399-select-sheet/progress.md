# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 из 4 — Showcase; both review rounds done
- **Next step:** the five kit remarks the owner added on 20.11 (the grill, last decision): a Figma
  frame for each and the owner's approval before code, then the closing texts, the push set (the
  sheet snapshots are re-taken: the sheet content got its paddings) and the draft PR.
- **Kit-match (20.11):** the select sheet against the mockup 6068:811 missed three numbers — the
  content side padding 20 (was 0), the title line height 24 (was `normal`, 19.5), the panel bottom
  padding 24 (was 0). Fixed in `rt-popover-sheet`; measured live at 375: 21 of 21. The mockup's
  search field is not in `rt-select` at all and goes to the PR as named.
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

1. [x] Stories of both fields at the narrow width with the sheet open and with the sheet off. —
   walked live on 6017 on 20.11 (see «Live walk» above); walked again after round one (a0292c8da):
   all 17 `Sheet` stories open the sheet over the whole visible width (360 = 375 less the desktop
   scrollbar CDK keeps), all `SheetOff` a panel by the trigger, no node past an edge. The real
   threshold on an unstubbed select: 375 and 480 → sheet, 481 and 768 → panel by the field.
   Focus stays on the select's field with the sheet open and after the backdrop close; the sheet is
   gone within 0.7 s. The locked handle: the kit look opacity 0.5; material colour at 38 % alpha
   against the others' rgb(103,103,103). —
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

## Review round one (20.11)

Three readers on the whole diff after the merge of main (78aca5229). Confirmed by code and sent to
two Sonnet agents (each item test-first): the material look of the disabled handle; no `sheet`
input on the date fields and the folded toggle group, and the folded select's ✕; the page header
burger and compact «ещё» without the sheet; a DI default `RT_POPOVER_SHEET` for nested parts; rt-menu
keyboard and focus return in the sheet; focus return of the popover sheet; two panels after
crossing the threshold; the sheet panel reset specificity; the close without slide-down; stubs
without `viewportNarrow`; «Show all»/«Reset» dropping disabled values; «Show all» by keyboard;
autocomplete clear, touched and keys in the sheet; `floatingLabel` as the sheet title; two docs
tables; two classes with no rule; four missing tests.

Fixed, checked here after the agents: the kit set 3829 green, lint, stylelint, tokens, cascade
layer, `check:specs`, the docs check and `build-storybook` green. Scenarios 1462…1484 written;
1382…1384 collided with the card from main (RT-3432) and became 1486…1488. The owner chose the
threshold: «До 480 px» — every sheet, the date fields too, reads `BreakpointsService.phone`.

Was for the owner: the threshold — the sheet opens at ≤1080 px (the date fields' threshold), the owner
said «на мобилке»; the kit has a phone signal at ≤480 px. Named in the PR, not fixed: the
multiselect has no search (mockup 6068:1250 shows one); icon-only speed-menu actions in the sheet;
the default switch of 20 components goes as a `BREAKING CHANGE` footer.

## Review round two (20.11)

Three fresh readers on the whole diff after a0292c8da. Confirmed here before the fix: typecheck
fails on `rt-autocomplete-sheet.spec.ts:102` (protected `value`); `check-boolean-inputs` refuses
`open` of `rt-popover-sheet`; `check-kit-coverage` refuses `rt-popover-sheet` without a story; the
date fields ignore `RT_POPOVER_SHEET` and coerce no `sheet`; `rt-table` and `rt-page-actions` do not
pass `sheet` down. Sent to two Sonnet agents with the rest, each checked against the code first:
focus into an inert sheet, a live `inSheet` read by the autocomplete and the multiselect footer,
the scroll lock lost on reopen during the close, focus returned to a non-focusable host, the fold
flipping in a flex row, no slide after a drag, the unnamed sheet dialog, the sheet search without
combobox roles, a search below `minLength` on tap, the footer counting unknown values, the panel
class dropped in the sheet, the RU admin labels. Fixed here: the select spec links the subdomain,
the spec names the three new labels (31e7abb1c), the RT-3432 row moved into the assignments table.
Checked here after the agents: the kit set 3853 green, typecheck, lint, stylelint,
`check-boolean-inputs`, `check-kit-coverage`, tokens, cascade layer, `check:specs` and the docs
check green; scenarios 1489…1505 written; the toggle group re-measures after its settle pause
(a resize inside the pause was lost). Live on 6017: focus lands on the first item of the menu and
of the tab menu in the sheet and ArrowDown moves it, the autocomplete focuses its sheet search, the
sheet dialogs are named by their titles; all 28 sheet and sheet-off stories pass the walk.

## Decisions along the way

- 20.11: the owner withdrew «планирование и ревью опус, код пишет сонет» — a neighbouring session
  passed the word on, and `~/.claude/CLAUDE.md` and the project memory no longer hold the rule
  (checked). The Sonnet agent already running finishes its brief; the rest is coded here.

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
- **Stage:** 4 из 4 — Showcase; both review rounds done
- **Next step:** stage 4, step 3 — the owner looks at the showcase on 6017 (up from this branch);

The progress in full — `docs/tasks/RT-3399-select-sheet/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
a65f3cb28 fix(rt:ui-kit-v2): исправления после второго круга ревью (RT-3399)
a1651399f docs(rt:ui-kit-v2): находки второго круга ревью записаны, строка назначения в таблице (RT-3399)
31e7abb1c docs(rt:ui-kit-v2): спека селекта ссылается на шторку, подписи вида с переключателями названы (RT-3399)
a8ad670c2 docs(rt:ui-kit-v2): живая проверка шторок после первого круга ревью (RT-3399)
a0292c8da fix(rt:ui-kit-v2): шторка только на телефоне и исправления после первого круга ревью (RT-3399)
fae1258a0 docs(rt:ui-kit-v2): шторка открывается только на телефоне, до 480 px (RT-3399)
08829070a docs(rt:ui-kit-v2): находки первого круга ревью записаны (RT-3399)
78aca5229 Merge remote-tracking branch 'origin/main' into RT-3399-select-sheet
99a384270 docs(rt:ui-kit-v2): иконки полей дат на линии селекта замерены вживую (RT-3399)
0e990dc8f docs(rt:ui-kit-v2): живой обход шторок на 375 и история автодополнения без шторки открывает подсказки (RT-3399)
79207a131 fix(rt:ui-kit-v2): закреплённая колонка показывает отключённую ручку перетаскивания (RT-3399)
336fadc12 docs(rt:ui-kit-v2): макет отключённой ручки закреплённой колонки нарисован (RT-3399)
7a4027a9d docs(rt:ui-kit-v2): ручка закреплённой колонки ждёт слова владельца (RT-3399)
eab0102a6 docs(rt:ui-kit-v2): ручка перетаскивания закреплённой колонки — в задаче RT-3399
19092052f fix(rt:ui-kit-v2): быстрые периоды в шторке поля периода переносятся на строки (RT-3399)
4b6db4799 docs(rt:ui-kit-v2): владелец выбрал перенос быстрых периодов в шторке периода (RT-3399)
3c61b1e39 docs(rt:ui-kit-v2): два варианта быстрых периодов в шторке периода нарисованы (RT-3399)
8e5da365e docs(rt:ui-kit-v2): быстрые периоды в шторке поля периода — в задаче RT-3399
701a3b419 docs(rt:ui-kit-v2): замер телефонных макетов шторки по узлам (RT-3399)
a96428cc5 test(rt:ui-kit-v2): истории шапки страницы, вкладок и подвала мультиселекта на телефоне (RT-3399)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
