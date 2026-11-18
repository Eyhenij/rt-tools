# Grill

## The owner request

> Делай эпик дальше

The task is #3336 of the epic RT-3346: under the chart block a `View data` switch shows and hides
the table of the chart data — the same points, order and number format; trees give their leaves;
the switch is not remembered. Done when the table matches the points row by row, negatives and
zeros visible, and the showcase has `line`, `grouped_bar` and `treemap`.

## What the tree already has

- RT-3335 left the rows ready: `rtAiChatChartData` maps the spec, `rtAiChatChartFormat` gives the
  number format by the kit locale, `leavesOf` gives the tree leaves with their paths, `xTextOf`
  writes a histogram bin as `low–high`. The copy text `rtAiChatChartText` already walks the same
  rows.
- The kit has two tables: `rt-table` (CDK Table, states, narrow-screen cards, column settings in
  IndexedDB) and `rt-data-table` (records of the first kit, sort and filter row). RT-3337 (the table
  block) will need a table too — one choice should serve both.
- The block title row has two icon buttons; a third control would go there or under the chart.

## Questions for the owner (with the recommended option)

1. Which kit table draws the data — `rt-table` (Recommended: the same table RT-3337 will take),
   `rt-data-table`, or plain markup with kit tokens.
2. Where the switch stands — a text button under the chart (Recommended: the task says «под блоком»),
   or a third icon in the title row.
3. The shape of a cartesian table — categories by rows, a column per series (Recommended: one row
   per category reads like the chart), or one row per point.
4. Whether the full-screen dialog has the switch too.

## Answers of the owner (18.11.2026)

- Which table — «Простая разметка». The own `<table>` is a departure from `rt-table` by the owner's
  word: it carries the `native-ok` marker naming `rt-table` and what it brings that the data table
  does not need (CDK, column settings in IndexedDB, cards).
- Where the switch stands — «Под графиком (Recommended)».
- The shape of a cartesian table — «Строка на категорию (Recommended)».
- The full-screen dialog — «Только в блоке (Recommended)».
- Mockup and plan — «Одобряю макет и план (Recommended)», 18.11.2026; mockup
  https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8196-839

## Next after answers

Mockup in the kit Figma file next to node 8165-448, measured, shown to the owner; then the plan.

## After the approval

- spec-critic named seventeen gaps in the agreement draft; all went into the rules: the head row per
  kind, heatmap a row per series, histogram of equal bins only, an inner node with its own value,
  the locale change, `aria-controls`, the kit labels of the head.
- The mockup head of `grouped_bar` became «Категория»: its sample has no `x` axis name, and the
  rule names the first column «Category» then. No other frame changed.
