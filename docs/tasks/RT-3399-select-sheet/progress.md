# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 из 4 — Showcase; both review rounds done
- **Next step:** the closing texts, take the folder apart, the push set (the sheet and workspace
  snapshots are re-taken) and the draft PR.
- **Main merged in (20.11), 183 commits.** Conflicts: the assignments table — main's side whole;
  the subdomain table of `docs/specs/ui-kit-v2/spec.md` — main's table with this branch's sheet row.
  Main had taken SC-UKV-1385…1389 and 1436…1505 for its own scenarios, so the branch's sheet block
  (those numbers and 1486) moved in order to SC-UKV-1554…1627 — only in lines the branch added: the
  sheet scenarios and 20 spec files' titles. The kit's scenario index got the sheet row it lacked;
  the input scenarios name the sample addresses in « » instead of backticks. `check:specs`,
  `check:docs`, `check:dupes`, `check:styles` green. After `pnpm install` (main brought ajv and
  d3) the kit typecheck is green and the kit's unit tests pass whole: 379 suites, 4148 tests.
- **Closing texts begun:** the out-of-scope line of the sheet spec now names the field help as the
  kit tooltip.
- **The showcase of `prefix` and `suffix` approved:** «Approve showcase» (20.11).
- **The hint at the field label joined (20.11), «проверь и добавь в текущий тикет»:** confirmed
  live on 6017 — `rt-field__help-popover` has a transparent background, padding 0 and no shadow,
  and with the icon at 1784 of a 1926 window the panel shrank to 142 and ran to the edge; the cause
  is `rtPopover` with positions only from the icon's start and no push. The kit tooltip measured
  live at the right edge: background `rgb(40,40,40)`, text white 12/16.2, padding 4/8, radius 4,
  shadow md, 6 above the host, pushed back to 1911 of 1926. The design file already holds an
  example of this hint, frame 6913:12721, drawn as a white Popover card — against the report,
  which expects the tooltip look. The owner asked «на светлой теме темная подсказка, а тултипа
  понимает смену темы?» — measured live: the tooltip is the inverted pair, in the light theme
  `rgb(40,40,40)` with white text on the page `rgb(250,250,250)`, in the dark theme white with
  `rgb(40,40,40)` text on the page `rgb(27,31,34)`.
- **The look chosen:** «Подсказка кита (рекоменд.)» — the hint takes `rtTooltip`.
- **Mockup drawn, frame 8477:2372 on the Field page:** three cells from the file's own Field and
  Tooltip components — in the middle of the screen, at the right window edge, the dark theme.
  Measured by nodes: the gap to the icon 6 in all three; in the middle and dark cells the tooltip
  centre stands on the icon centre (0); at the edge its right side is the window edge (0) and it is
  moved 90 left of the icon; width 240, text two lines 32 high; no overlap with the page frames.
- **Frame 8477:2372 approved:** «Одобряю макет» (20.11).
- **The hint in code (20.11):** the «?» of `rt-field` carries `rtTooltip` with `rtTooltipShowOnTap`;
  the popover, its template and the `__help-popover` rule are gone. Rule and scenarios
  `SC-UKV-1551`, `SC-UKV-1552` in the subdomain `field-label-icon-actions`; field specs 29 of 29,
  typecheck, eslint, stylelint, `check:specs`, `check:tokens-styles` green.
- **Measured live on 6017 with the mockup text:** gap 6, centre offset 0, padding 4/8, radius 4,
  font 12, text two lines 32, light island `rgb(40,40,40)` with white text, dark island white with
  `rgb(40,40,40)` text. Two numbers differ from the frame, and both are the kit tooltip's own
  behaviour, not this edit: the width is 256, because `max-width: 240px` limits the content and the
  padding 8+8 comes on top, while the frame's Tooltip copy is 240 whole; at the right window edge
  the tooltip stops 16 from the edge (CDK push with the viewport margin 8), 8 from the left edge,
  while the frame draws it flush.
- **The owner chose «Поправить макет» (20.11).** The file's Tooltip copy (4647:2752) got a text
  limit of 240 and a frame limit of 256; in frame 8477:2372 the three tooltips are 256 wide, the
  edge cell stops 16 from the window edge, and the frame texts name 240 / 256 and the margins 16
  and 8. Measured by nodes: width 256, height 40, text 32, gap 6 in all three, centre offset 0 in the
  middle and dark cells, −114 at the edge, no overlap with the page frames. `kit-match` against the
  live numbers of 6017: 19 of 19.
- **The redrawn frame 8477:2372 approved:** «Одобряю макет» (20.11).
- **Review round over the hint change (20.11), three readers on the whole diff.** None blocks.
  Fixed: SC-UKV-1552 now taps the «?» and finds the tooltip with the help text (it checked only
  the input); the empty half of SC-UKV-1551 removed; the «?» is described by the help text through
  a hidden node and `aria-describedby`, new scenario SC-UKV-1553 (the tooltip itself links nothing
  to the button, the old popover did not either); the spec says Escape closes while the focus is on
  the «?»; the index table re-formatted. Live on 6017: the hidden node is `display: none` in both
  halves. Field specs 30 of 30, typecheck, eslint, `check:specs` green.
  Written off: «the tooltip stops 8 from the edge, not 16» — measured live 16 (1910 of 1926).
  For the PR body: `field-help-popover` and `rt-field__help-popover` are gone, the text is in
  `rt-tooltip[role=tooltip]`. To the owner as a choice: the kit tooltip closes when the pointer
  moves onto its text, and a click after hover closes it (the `showOnTap` toggle) — both are the
  kit tooltip's behaviour for every consumer.
- **Re-measured after the review fixes (20.11), on the owner's «матчится с макетами?»:** Chrome on
  6017, Playground with the mockup text, the middle, the right window edge and the dark island;
  `kit-match` against frame 8477:2372 — 19 of 19.
- **The hint showcase approved:** «Одобряю витрину» (20.11). The tooltip behaviour choice, given
  before: «Оставить, назвать в PR (рекоменд.)» — the PR body names both closings (pointer onto the
  text, a click after hover).
- **`prefix` and `suffix` of `rt-input` in code (20.11), mockup 8449:1560 approved «Одобряю
  макет»:** the prefix stands before the field, the suffix right after the typed text — a hidden
  copy of the text sizes the field, the field lies over it. Measured live on 6017, own set: the
  prefix 17…105, the value from 105 with gap 0, the suffix after the value with gap 0, height 40,
  text top 11, colour `rgb(103,103,103)`; the narrow field 200: the prefix whole, the value cut at
  183, the suffix ends at 183; typing one letter grows the field 64 → 72 and moves the suffix with
  it, `scrollLeft` 0. kit-match 23 of 23. The long value in the narrow field ends with the kit's
  ellipsis (SC-UKV-1116), so a few pixels stand between «…» and the suffix where the mockup clips.
  Specs 3870 of 3870, typecheck, eslint, stylelint, check:tokens-styles, check:cascade-layer, the
  docs tables and check:specs green. Scenarios SC-UKV-1541…1545; the branch's SC-UKV-1506 and
  SC-UKV-1507 were taken on main by the tag and the chat section and became SC-UKV-1546 and
  SC-UKV-1547.
- **Four approved remarks in code (20.11), measured live on 6017:**
    - the filters panel of `rt-thread-list`: 254×134, background `rgb(255,255,255)`, border 1 px
      `rgb(224,224,224)`, radius 10, the select panel shadow, padding 16 (was transparent, 252×132);
    - the date and period panel: `rtPopoverOrigin` is the field root, the panel right edge 1910
      equals the field right edge 1910 (was 1901), the top 60 stands 4 px under the field bottom 56
      (was flush), for both fields;
    - `rt-workspace`: at 900 the strip with back and details is gone and the story header shows the
      details button by `asideButtonInHeader()` (top 16); at 500 and 1300 the strip is as before,
      in the stories with the threshold input 600 and without it;
    - one focus ring: tabs, the tab close button, the clickable table row, the sort header, the
      night grid, the page header family (seven places) and the chat translation draw
      `--rt-focus-ring-width` solid `--rt-focus-ring-color` — measured 3 px, `#155dfc` at 24 %,
      offset 0 (inset −3 where the strip or the row clips); `--rt-nav-color-focus` stays published
      but the kit no longer reads it.
  Specs 3860 of 3860 (SC-UKV-1506 five cases, SC-UKV-1507 two), typecheck, eslint, check:specs,
  the docs tables, check:tokens-styles, check:cascade-layer and stylelint green.
- **The four remarks committed (20.11):** 50570df3b, the showcase approved «Одобряю витрину».
- **Mockup of the fixed text of `rt-input`, waiting for the owner:** frame 8449:1560 on the Input
  page, two rows — `prefix` before the value and `suffix` after it (the owner's remark «нужно 2
  варианта когда можно дописать сзади в впереди»), each empty, filled, focus, error, disabled and
  a narrow field 200 wide. The owner also found the focus ring clipped («тень обрезана»): the cell
  and the row clipped their content, now no ancestor of a ring clips. The copy of the field matched
  the showcase before drawing (40 high, padding 16, gap 8, border `#e0e0e0`, radius 10, Montserrat
  14). Measured: prefix row — the prefix at 17, the value right after it with gap 0, the long value
  clipped at 183 of 200; suffix row — the value at 17, the suffix right after it with gap 0, in the
  narrow field the suffix stays whole at 137…183 and the value is clipped at its edge; everything
  centred at 20; no overlap with the frames of the page. The owner then found the value text cut
  («текст обрезан»): the clipping frame was 14 high, the text line height 100 %, and the descender
  of «y» fell outside. The value, prefix and suffix texts now take the kit line height 135 %
  (18.9 in the showcase): text 19, clip 19, no text crosses its clipping frame in all twelve fields.
- **Kit-match of the four remarks (20.11):** the first run gave 27 of 29 — the filters panel 252 in
  the mockup against 254 (the copy counted the border in the height only) and the tab ring outside
  against inside (the tab strip scrolls, 0 px room on three sides). The owner: «Поправить макет»;
  frame 8437:2768 is 254 wide, tab 8437:5826 draws its ring inside with a caption. Second run 29 of
  29. Not measured against the mockup: the header lines at 70 of the workspace — no story puts the
  thread list and the conversation on one workspace; the date panel copy in Figma is 778×372 against
  814×413 in the kit, the same in the «now» frame, outside this edit.
- **Mockups of the five kit remarks (20.11), approved «Одобряю все»:** the filters panel surface —
  node 8437:2659 (live: the panel 252×132, background transparent, no border or shadow); one focus
  ring — node 8437:5765 (31 style files draw the soft ring, the page header family a 2 px dash,
  the tabs and the table a 2 px solid outline, the night grid and the chat translation a
  `border-focus` outline); the workspace at 768–1080, headers and back button in one frame — node
  8437:9117 (the toolbar row of 48 moves the conversation header line from 70 to 118 under the
  list line at 70); the date and period panel at the field edge — node 8437:4466 (live: the panel
  right edge 9 px inside the field, top flush with the field bottom).
- **Empty date field mask (20.11):** the owner approved `--.--.----` (frame 8423:1981); the hint is
  now `RT_DATE_SHAPE_MASK`, one for every language, and the `uiShape*` labels left the kit. Measured
  live on 6017: date `--.--.----` (size 10), date-time `--.--.---- --:--` (16), time `--:--` (5),
  range `--.--.---- — --.--.----`, the empty range field 286 wide with no clipping (scrollWidth equal
  to clientWidth). Specs 3853 of 3853, typecheck green.
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
2. [x] `rt-multiselect`: the same; the sheet stays open on a choice. — plus the footer «Выбрано: N · Сбросить · Готово» by the mockup 6068:1250, scenarios SC-UKV-1559…1438, the spec 11 of 11.
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

## Review round one of the four remarks (20.11)

Three fresh readers on 50570df3b. Confirmed and fixed:
- **High — the workspace hid the strip for every consumer.** The admin chat panel and the talks
  page put no details button in their header, so at 768–1080 the details were unreachable. Now
  the strip leaves only with the new input `detailsInHeader`; `asideButtonInHeader` also needs a
  declared aside. Live on 6017 at 900: the story with the input has no strip and its header «i»,
  the story without it keeps the strip; at 500 and 1300 both as before.
- **Two more focus looks:** the notification bell (1 px dashed `border-strong`) and the login link
  (2 px `action-primary`), plus the showcase sort header — all on the shared ring now; the bell
  measured live 3 px, `#155dfc` at 24 %, offset 0.
- **Specs proved less than their titles:** the popover spec now checks that the panel is placed by
  `rtPopoverOrigin` and takes its width (320); SC-UKV-1506 covers 768/769, 1080/1081, an
  undeclared place and the default without the input.

Written off: the soft ring is 1.43:1 against white — the owner approved this very ring for the
whole kit, the cost is named in the PR; the 3 px night-grid ring in a 4 px gap breaks nothing;
«768 now counts as one column without the input» does not hold — `singleColumn` is unchanged and
the new count feeds only `asideButtonInHeader`; the header lines (remark 3) follow from the strip
removal and line up when the application declares `detailsInHeader`. Specs 3865 of 3865,
typecheck, eslint, stylelint, check:tokens-styles, check:cascade-layer, docs tables, check:specs
green.

## Review round two over the whole diff (20.11)

Three fresh readers on the diff after 066bd257b. Confirmed and fixed:
- **High — the password leaked into the copy that sizes the field.** With `type="password"` and a
  suffix the hidden copy held the typed characters in a text node; it now holds as many dots, and
  the width follows the drawn dots. SC-UKV-1549.
- **Medium — the label on the border lay over the prefix.** The material set rests the label in
  the place of the hint; a field with fixed text now keeps it raised, as a Material field does. The
  class is its own, `rt-input--label-raised`; `--filled` keeps meaning «has a value», since an
  application's styles may read it. SC-UKV-1548.
- **Medium — the filled and pill material field with a label lost its value with a suffix, and
  set the prefix off the value line.** The value padding under the raised label moved into the
  property `--rt-input-fill-value-padding-block`, and the prefix, the suffix and the copy take it
  too. Read in the code; no story shows this combination, so it is not measured live.
- **Medium — an empty field with a suffix and no hint had a zero-wide field and no caret.** The
  value box keeps the width of the border.
- **Low — a press on the fixed text left the caret where it was.** The suffix puts it at the end,
  the prefix at the start; a mail field has no selection and is left alone. SC-UKV-1550.

Written off: «the showcase is not approved» — read before «Approve showcase» was written; «the
caret at the end shifts the text» — measured live, `scrollLeft` 0 after typing at the end; «a long
prefix overflows a narrow field» — the approved mockup keeps the fixed text whole, the application
chooses its length; «the scope grew past the sheet» — the owner took the remarks into this task by
word, they stand in the grill; the major release, the application's `detailsInHeader` step and the
1.43:1 ring go into the PR body; «Approve showcase» is the owner's message verbatim.
Live on 6017 after the fixes: the `Affixes` numbers are unchanged in both sets (own: prefix
17…105, suffix after the value, height 40; material: height 56, text top 17). Input specs 107 of
107, eslint, stylelint, prettier, check:specs green.

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
- **Next step:** review round two over the whole diff is running (three readers started 20.11 on

The progress in full — `docs/tasks/RT-3399-select-sheet/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../../../../../../docs/tasks/RT-3399-select-sheet/approvals.md
 M rt-field.component.html
 M rt-field.component.scss
 M rt-field.component.ts
```

### Commits over the main branch

```
cf5812cc7 docs(rt:ui-kit-v2): макет подсказки у подписи поля нарисован и замерен (RT-3399)
aa410cfe1 docs(rt:ui-kit-v2): подсказка кита замерена в обеих темах (RT-3399)
f15f99b39 docs(rt:ui-kit-v2): подсказка у подписи поля принята в задачу и проверена вживую (RT-3399)
72bbc66c2 fix(rt:ui-kit-v2): исправления после второго круга ревью постоянного текста поля (RT-3399)
13401889a docs(rt:ui-kit-v2): витрина постоянного текста одобрена, идёт второй круг ревью (RT-3399)
066bd257b feat(rt:ui-kit-v2): постоянный текст до и после значения в rt-input (RT-3399)
9f7b26a08 fix(rt:ui-kit-v2): исправления после первого круга ревью четырёх замечаний (RT-3399)
0a78fb1ba docs(rt:ui-kit-v2): следующий шаг — ревью четырёх правок, пока макет поля у владельца (RT-3399)
fed16f9d5 docs(rt:ui-kit-v2): в макете поля текст больше не обрезается снизу (RT-3399)
9acdca64f docs(rt:ui-kit-v2): макет поля дорисован — текст после значения и целое кольцо фокуса (RT-3399)
abbb4dd4f docs(rt:ui-kit-v2): макет постоянного начала адреса в поле нарисован и замерен (RT-3399)
50570df3b feat(rt:ui-kit-v2): фон фильтров, одно кольцо фокуса, стол без «назад», панель даты по краю поля (RT-3399)
71f819920 docs(rt:ui-kit-v2): макеты пяти замечаний приложения нарисованы и замерены (RT-3399)
d1d5a01d5 feat(rt:ui-kit-v2): пустое поле даты и периода подсказывает маской из чёрточек (RT-3399)
1d96f6aa6 feat(rt:ui-kit-v2): новый значок календаря calendar-2 у полей даты и периода (RT-3399)
488a608e4 docs(rt:ui-kit-v2): новый значок календаря у полей даты и периода — в задаче (RT-3399)
290a06964 fix(rt:ui-kit-v2): отступы шторки по макету — 20 по бокам, 24 снизу, строка заголовка 24 (RT-3399)
1c57014b1 docs(rt:ui-kit-v2): витрина одобрена, пять замечаний приложения по киту — в задаче (RT-3399)
1c22d6523 docs(rt:ui-kit-v2): прогресс — оба круга ревью закрыты, витрина ждёт владельца (RT-3399)
a65f3cb28 fix(rt:ui-kit-v2): исправления после второго круга ревью (RT-3399)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
