# Grill

The work is begun from no cargo record.

## The owner request

> сначала сделай RT-3342, потом вливаем

Said in answer to «можно ли уже сейчас вмержить G?»: the epic branch goes into the main one after
this task. The task card, verbatim:

> ## Что не так
>
> Составной ответ (строка итога, ряд KPI, несколько графиков, таблица) в ленте стоит столбиком. В полноэкранном режиме графики не встают рядом, в узкой панели не перестраиваются.
>
> ## Что нужно от кита
>
> - Блок `section` с заголовком и вложенными блоками.
> - Сетка внутри секции: число колонок по ширине ленты (1 в узкой панели, 2 в полноэкранной), блок может занять всю ширину.
> - Порядок блоков в сетке как в массиве.
>
> ## Готово, когда
>
> Ответ «обзор месяца» (итог, 4 KPI, 2 графика, таблица) рисуется сеткой в полноэкранной панели и столбиком в узкой. В витрине есть обе ширины.
>
> Зависит от RT-3335, RT-3337, RT-3338.

## What the tree already has

- **The blocks are flat.** `toBlockViews` and `blockText` in `rt-ai-chat-blocks.logic.ts` map a
  list once; neither calls itself, and the blocks component does not draw itself. The feed of
  blocks is a flex column with a gap of 8 and has no container query.
- **The kit's own types are `markdown`, `notice`, `table`, `kpi`** (`OWN_TYPES`); a broken own type
  is the plate. The chart is not an own type: it is a registry renderer of the separate entry
  `ai-chat-chart`, registered by `provideRtAiChatChart()`.
- **Every heavy block already follows its own width.** The KPI block is a container: one column
  below 328, two from 328, four from 664. The chart has a fixed height of 188, no minimum width,
  and thins its labels by a `ResizeObserver`. The table scrolls inside itself.
- **The widths a block meets:** the narrow panel gives 386 (328 on a phone); the full screen
  without threads about 926, with the thread column about 646; a reading column of `40rem` gives
  640. The kit sets no width of its own for the full screen: the consumer sets
  `--rt-ai-chat-content-max-width`.
- **No story composes a summary, KPI, charts and a table in one answer.** A story with real charts
  needs `provideRtAiChatChart()`, which today only the chart stories register.
- **Block titles are 14 SemiBold** (the chart and the table); markdown headings are 18, 16 and 14.
- **Schemas** of the table and the KPI are in the main entry, the chart schema in its own entry;
  there is no joint schema of all blocks.
- **The epic findings that apply:** a KPI block in a section narrower than 328 must fall to one
  column, and RT-3342 owes a narrow section story; the plan of a chat block names a chat story in
  every mode the card names, and a 40rem reading column gives 640.

## What the rules already say

- The rule `kit-approval`: a Figma mockup and the owner's approval come before the code.
- The rule `mockups`: the mockup is built from the kit copy in the file, on instances, and is
  measured before it is shown; the incident analysis of 19.11.2026 is about exactly that.
- The pattern `task-flow-start`: the owner took the recommended option more than twice running in
  this session, so the six questions close by assumption and go below as decisions.

## Questions and answers

None asked: see the decisions.

## Decisions

The six questions, closed by assumption:

- **The task changes behaviour** — the answer draws a new block type that holds other blocks. A
  product agreement is written in the kit's proposed specs after the mockup is approved.
- **No law or rule is edited.**
- **One task** — the block, its nesting in the views and in the copy, its schema and its stories
  roll back together.
- **Not part of the task** — the link card (RT-3339), the sources (RT-3340), a section inside a
  section, a collapsible section, columns set by the consumer.
- **Closed when** — the card's sign: the answer «обзор месяца» (a summary, 4 KPI, 2 charts, a
  table) draws as a grid in the full-screen panel and as a column in the narrow one; the showcase
  has both widths, matches the approved mockup by numbers and is approved by the owner.
- **Sample** — the wiring of the `kpi` block; its container query for laying out by own width.

Design decisions taken by assumption, shown to the owner on the mockup:

- **`section` is a kit type with an optional `title` and `blocks`.** A section without a block to
  draw is the plate.
- **The grid follows the width of the section, not the mode of the chat:** one column below 640,
  two from 640. So the full screen (926, 646) and a 40rem reading column (640) give two columns,
  and the narrow panel (386, 328) one.
- **A block takes the whole row or one column.** By default a text, a notice, a KPI row and a table
  take the whole row, and any other block — a chart, an application block — one column. A block
  says otherwise by `span: "full"` or `span: "column"`.
- **The order is the order of the array;** a lone block in a row of two keeps its column width.
- **A section inside a section is not drawn** — it is the plate: one level is enough for the
  answer the card names.
- **The answer copy** gives the title and then the texts of the nested blocks, as if they stood in
  the feed.
- **The kit exports a JSON schema of the section:** the title and a list of blocks, each with its
  `type` and optional `span`.
