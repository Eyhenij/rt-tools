# Grill

Task already issued: RT-3399 (feature, outside an epic by the request of the application owner).
Assignee — treble3d, by the owner's word.

## The owner request

> найди тикет для селекторов и меню на мобилке открываются ботом шит, но это опционально

> бери в работу тикет асайни на меня, на каких компонентах это уже реализовано?

## What the tree already has

- `rt-bottom-sheet` — the bottom sheet of the second kit.
- `rt-date-picker` — on a narrow screen the end button opens the sheet (`openPanel`, `sheetOpen`),
  on a wide one the popover. No input switches the sheet off.
- `rt-date-range` — the same switch by `sheetOpen`; its panel takes the input `sheet`.
- `rt-page-bar` inside `rt-page-header` — the page filters open in the sheet on a narrow screen.
- The narrow-screen threshold is one for the kit: `BreakpointsService.narrow`.
- `rt-select`, `rt-multiselect`, `rt-menu` — no sheet; the list opens next to the trigger at any
  width.
- RT-3399 names only `rt-select` and `rt-multiselect`; neither the menu nor an opt-out is in it.

## What the rules already say

- A visible kit edit goes through a Figma mockup and the owner's approval first (rule
  `kit-approval`).

## Questions and answers

**Does the menu go into RT-3399 or into a task of its own**
First closed by the rule `task-flow` as a task of its own; the owner overruled it:
«все в этом тикете делать, везде где можно прикрутить ботомшит вид на мобилке».

**What "optional" means** — chosen from: A) the sheet by default on a narrow screen, an input
switches it off; B) no sheet by default, an input switches it on.
«1 А»

**File the ticket with the rules remarks from the neighbouring session**
«2 да»

**Arrived from a neighbouring session, not yet confirmed by the owner here**
Quoted as the owner's words: «пусть включит в тикет реализацию селекта с оверлеем и тоглами + отображение на мобилке в ботомшит».
The application has a category filter that looks like `rt-select` and opens a panel of toggles:
"show all", "hide empty", a divider, a toggle per category; the field label is "all" or "N of M".
It is built around the kit with a wrapper (`rtPopover`, an inert `rt-select` for the label, a
hand-set open modifier). Asked of the kit: a mode of `rt-select` (or a component of its own) that
opens an overlay with projected content or a ready list of toggles with an "all" item, keeping the
label, chevron, open state and Enter/Space; on a narrow screen the same panel opens in the sheet.

Also from a neighbouring session, a code count over the application: no sheet in `rt-select`
(94 places), `rt-menu` (6 menus), `rt-autocomplete` (6 places), `rt-tabs` (the application draws a
sheet of its own over it).

## Decisions

- **Every kit component with a drop-down panel gets the sheet in RT-3399** — the owner's word
  «все в этом тикете делать, везде где можно прикрутить ботомшит вид на мобилке». The first
  decision (the menu and the toggles select as tasks of their own) is withdrawn by it. The set:
  `rt-select`, `rt-multiselect`, `rt-menu`, `rt-autocomplete`, the overflow and context menus of
  `rt-tabs`, `rt-split-button`, `rt-speed-menu`, `rt-dynamic-selector`, `rt-color-palette`, and the
  select with a toggles panel. Tooltips, confirm popovers, dialogs and asides stay as they are —
  they are not lists to choose from.
- **Five more places join the set** — the owner's word «Да, все пять»: `rt-toggle-button-group`
  folds into a field that opens the sheet when its values do not fit the width; the action menu of
  `rt-action-bar`; the filters panel of `rt-thread-list`; the user menu, the «ещё» panel and the
  submenu of `rt-page-header`; the operator choice in the table filter header. The help popover of
  `rt-field` stays — it is text, not a choice.

- **The date picker and the trailing icons of every select and picker join the task** — the owner's
  words «включи в задачу поправить дейт пикер пример селектора» and «проверить у всех селектов и
  пиркеров иконки на одном и том же месте», with two screenshots: a date field on a phone, and a
  select «Статус» above a date field «Выезд» where the chevron and the calendar icon stand on
  different vertical lines. Read as: the date field takes its icon place from the select, and the
  trailing icon of every select and picker of the kit stands on one vertical line, measured.

- **The quick ranges of the period field in the sheet join the task** — the owner's words «добавь в
  тикет», with a screenshot of the period field's bottom sheet on a phone: the row «Сегодня ·
  Вчера · Последние 7 дней · По…» runs past the sheet, the last chip is cut by the sheet's edge, and
  an arrow points at the cut. The row scrolls sideways (`overflow-x: auto`, the scrollbar hidden),
  but nothing shows that it does, so the cut reads as broken layout. Read as: in the sheet the
  quick ranges either show that the row goes on, or all fit; the choice goes to the owner with a
  Figma frame before code.

- **The locked column keeps its drag handle, disabled** — the owner's words «включи в задачу не
  прятать иконку драга а дизеблить», after a screenshot of the table's «Настроить столбцы» panel
  where the locked row «Роль» has an empty place instead of the handle. Read as: in the column
  settings of `rt-table` a locked row draws the same drag handle as the others, in the disabled
  look and not draggable, instead of the empty placeholder.

- **The sheet opens only on a phone, ≤480 px** — the owner's words «До 480 px», asked after review
  round one showed that the kit's narrow threshold (1080 px) gives the sheet to a landscape tablet
  and a narrow laptop window. Read as: every panel of choice of the kit, the date fields included,
  opens in the sheet at the phone threshold of `BreakpointsService`; wider, next to its trigger.

## What is left unclear
