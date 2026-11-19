# Grill

The work is begun from no cargo record.

## The owner request

> Делай эпик дальше

The epic plan `docs/plans/ai-chat-blocks.md`, row 6, names the next task: RT-3338 — the block of KPI
cards with a delta to a base. The task card, verbatim:

> ## Что не так
>
> Для обзорных ответов («обзор месяца») ассистенту нужен ряд ключевых показателей с изменением к базе сравнения. В ленте чата таких карточек нет.
>
> ## Что нужно от кита
>
> Блок `kpi` для `rt-ai-chat` поверх `rt-stat-tile`:
>
> - элемент: название, значение, формат (`number` / `percent` / `currency`), дельта к базе с подписью базы (`vs LY`), период;
> - цвет и знак дельты из токенов, направление «рост — хорошо» задаётся на элементе;
> - сетка 2 колонки в узкой панели, 4 в полноэкранном режиме.
>
> ## Готово, когда
>
> Ряд из 4 карточек с положительной, отрицательной и нулевой дельтой рисуется в узкой и полноэкранной панели. В витрине есть обе ширины и обе темы.

## What the tree already has

- **`rt-stat-tile`** (`projects/ui-kit-v2/src/lib/components/stat-tile/`, spec
  `docs/specs/ui-kit-v2/stat-tile/`, SC-UKV-1125…1132). It takes `label`, an already written `value`,
  `secondary`, `deltaPrimary` and `deltaSecondary` of the shape `{ percent, unit?, label, baseline? }`,
  `hint` and `growthIsWorse`. Colour and arrow of a delta come from the tokens
  `--rt-color-state-success` / `-danger`, muted when flat; `growthIsWorse` swaps the colours, the
  arrow follows the sign. The delta number is written by `signedNumber`: a plus, an ASCII minus and a
  comma put by hand, not by the kit locale. The delta `label` is only a `title` of the delta, not
  visible text; `baseline` is a visible line «base: …». The tile draws no border or background.
- **The kit's own block types** are wired in `rt-ai-chat-blocks.logic.ts` (`OWN_TYPES`, the data
  function per type, `toBlockViews`, the copy text `blockText` and `blocksToPlainText`),
  `rt-ai-chat.model.ts` (the block and view unions) and `rt-ai-chat-blocks.component.html` (a case
  per kind). The closest sample is the `table` block of RT-3337: `blocks/table/`, the lenient data
  function `lib/util/table-data.ts`, the schema `lib/util/table.schema.ts`.
- **Writing a value by the kit locale** is ready: `rtTableCellWriter` writes number, percent (a
  fraction) and currency by `Intl` and marks a minus. A delta needs a sign on growth too, which that
  writer does not give.
- **A block cannot tell the narrow panel from the full-screen mode today.** `fullScreen` of
  `rt-ai-chat` reaches no block; a renderer gets only `block`. The width is the only signal, and a
  block-local container query is a technique the kit already uses (`rt-pagination`, `rt-file-drop`).
- **The epic plan** names 4 KPI cards in the milestone answer «обзор месяца»; nothing more on
  RT-3338. The findings of the epic: a mockup draws a frame for every width the block meets; story
  wrappers use `templateUrl`.
- **No KPI mockup exists.** The approved mockups of the epic live in the file
  `vyV42sJXccfKNG8yFSCpSL`: RT-3334 8061-2096, RT-3335 8165-448, RT-3336 8196-839, RT-3337 8215-449.

## What the rules already say

- The rule `kit-approval`: a visible kit edit starts with a Figma mockup and the owner's approval,
  then the code and every state in the showcase; the showcase matches the mockup and is approved.
- The rule `reuse-first`: the block is built on the ready `rt-stat-tile`, not drawn anew.
- The pattern `task-flow-start`: the owner took the recommended option more than twice in a row in
  this session, so the six questions close by assumption and go below as decisions.

## Questions and answers

None asked: see the decisions.

## Decisions

The six questions, closed by assumption:

- **The task changes behaviour** — the chat answer draws a new block type. A product agreement is
  written in `docs/specs/ui-kit-v2/proposed/ai-chat-kpi/` after the mockup is approved, as in RT-3337.
- **No law or rule is edited** — the block follows the rules the table block followed.
- **One task** — the block, its data function, its schema, its copy text and its stories roll back
  together.
- **Not part of the task** — a sparkline, a click on a card, the section and the grid of a composed
  answer (RT-3342), the sources block (RT-3340).
- **Closed when** — the card's sign: a row of 4 cards with a positive, a negative and a zero delta is
  drawn in the narrow and the full-screen panel; the showcase has both widths and both themes; the
  showcase matches the approved mockup by numbers and is approved by the owner.
- **Sample** — the wiring of the `table` block; the look of `rt-stat-tile`.

Design decisions taken by assumption:

- **The card is `rt-stat-tile`, not a new drawing** — the rule `reuse-first`. What the tile lacks
  is added to the tile itself, so every consumer of the tile gets it.
- **The value is written by the kit locale through the table writer** — a format per item: number,
  percent as a fraction, currency with a three-letter code; the same rule as a table cell.
- **The delta number is written by the kit locale, with a sign on growth** — the tile's hand-made
  comma diverges from the value next to it in any locale but Russian. The tile learns to write the
  delta by `Intl`; in Russian its text stays as it is, which the snapshots of the tile confirm.
- **The base caption («vs LY») is visible next to the delta, the period is the secondary line** —
  the card asks for a caption, and a `title` is not seen on a touch screen. How it stands is drawn in
  the mockup after measuring the tile in the showcase.
- **«Growth is good» is the item flag `growthIsGood`, default true** — the card's words; it maps to
  the tile's `growthIsWorse`.
- **Two or four columns follow the block's own width by a container query** — a block does not know
  the chat mode, and wiring `fullScreen` into every block is new reach for one layout. The narrow
  frames 328 and 386 give two columns; the threshold is chosen in the mockup.
- **The kit exports a JSON schema of the block** — as for the chart and the table, so an
  application gives it to the model as tool parameters.
- **The answer copy writes each card as one line** — label, value, delta with its base caption,
  period; the same lenient rule: an item without a label or a value is dropped.

Decisions the mockup made, after measuring the tile in the showcase:

- **The KPI card value is 24/24 Bold, not the tile's 32** — two columns in a 328 block leave 160 a
  card, and a 32 px «1 240 000 ₽» is 192 wide. The tile gets a size option for it.
- **A value of a million and more is written short by the kit locale («1,24 млн ₽»), below a
  million in full («8 400 ₽»)** — even at 24 px a full seven-digit sum does not fit 136 inside a card.
- **The block frames each card (border, radius 12, padding 12)** — the tile draws no frame by its
  own spec; the frame is the container's job.
- **Four columns from a block width the mockup shows as 728, two below** — the threshold lies
  between 386 and 728 and is named in the agreement.

## What is left unclear

- The mockup is the owner's step: it is drawn and shown before the code.
- The container threshold for four columns is set by the mockup frames, not here.
