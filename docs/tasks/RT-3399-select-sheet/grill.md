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

- **The kit's part of the application's interface remarks joins the task** — the owner's words
  «посмотри что из описанных багов правится в ките и возьми в этот тикет в слаке отметь иконкой
  глазками» (20.11), about the remarks thread of the application's issues channel. Each remark was
  checked against the kit's code; five are the kit's and got the eyes mark:
    1. «фильтры на странице переписок открываются без бг» — the filters panel of `rt-thread-list`
       (`&__filters-panel`) declares no background, border or shadow, so the popover draws it
       transparent over the list.
    2. «стили фокуса разные на элементах» — the kit draws the focus ring in four ways: solid
       `--rt-focus-ring-*`, dashed `--rt-nav-color-focus` (2 px and 1 px), solid
       `--rt-color-action-primary`, and the field border. Read as: one focus ring for every
       interactive element of the kit.
    3. «в переписках сделать ровнымы хедеры» — the header of the thread list (search and filter)
       and the header of the open conversation stand at different heights in `rt-workspace`. Read
       as: both column headers share one height and one bottom line.
    4. «убрать стрелку назад для этого темплейта, переместить i в одну строку с другими экшенами» —
       `rt-workspace` draws its `mobile-toolbar` (back and details) above the conversation while
       the list column is on screen. Read as: no back button while the list is visible, and the
       details button stands in the conversation header row with its other actions.
    5. «подвинуть панель дэйтпикера на одну линию с полем инпута дат» — the panel of the period
       field opens offset from the field. Read as: the panel's edge lines up with the field's edge.
  The calendar glyph itself joins too — the owner's words «а что с дейт пикером ты сделал по
  обрпзце селект и иконку новую?» (20.11). The remark «может стоит поменять иконку на что-то более
  интересное» was set aside to RT-3428, and RT-3428 merged without it: the date and period fields
  still draw `ico-calendar`. Read as: a new calendar glyph for both fields, chosen by the owner from
  variants on a Figma frame.
  Left to the application, not marked: the notification strip, the report preview blur (the
  screen's own overlay, not found in the kit), the month switcher in the page header, the reports
  in the navigation menu, the missing quote in a chat message (the chat bubbles are not the kit's),
  and the seven top-level messages of 20.11 (demo, logo, organisations, registration, address,
  card width, save progress).
- **The whole channel is read again, and its one more kit remark joins** — the owner's words
  «глянь все замечания которые относятся к киту и включи в эту задачу» (20.11). Every thread was
  read to its replies. One more is the kit's and got the eyes mark: the registration thread
  («что-то не так на регистрации», «видимо пользаков смущают поля про сайт и названия») shows a
  page address field whose fixed part `qlick.io/anatoly/` stands inside the field before the
  editable part, and `rt-input` has no fixed text before the value. Read as: `rt-input` gets a
  fixed text prefix, drawn on a Figma frame and approved before code. The aside placeholder of the
  «UI issues» thread is already merged with RT-3428. The rest stays the application's: the demo
  page, the logo on the organisation choice, the disabled organisation switch (the profile menu
  takes the `denied` mode from the application), the domain choice by radio buttons, the settings
  card width and the save progress.
- **The hint at the field label joins** — the owner's words «проверь и добавь в текущий тикет»
  (20.11) under a pasted report: the `rt-field` hint (input `help`) «рисуется без фона и выходит
  за край окна»; expected «вид как у rtTooltip кита» and «окно должно стоять в окне браузера
  целиком: сдвиг к центру (withPush) или запасные положения с выравниванием по правому краю
  значка». Checked live on 6017: the hint panel has a transparent background, no padding and no
  shadow; with the icon at 1784 of a 1926 window the panel shrank to 142 and its text ran to the
  window edge. Read as: the hint takes the kit tooltip — its look, its push into the window and
  its fallback positions — drawn on a Figma frame and approved before code.
- **The page bar filters at the 480 boundary join** — «Сделать в этой задаче» (20.11): wider than
  a phone the filters button opens a panel by the button, a phone keeps the sheet.
- **A select inside the filters sheet** — «внутри ботомшита с фильтрами сами селекторы должны тоже
  открываться ботомшит на мобилке» (20.11).
- **Sheets replace each other** — «ботомшиты не накладываются а подменяют, при закрытии верхнего
  показывается предыдущий» (20.11).
- **The multiselect search joins** — «Да, в этой задаче» (20.11), the answer to whether the
  multiselect search the approved mockup 6068:1250 draws goes into this task.

## What is left unclear
