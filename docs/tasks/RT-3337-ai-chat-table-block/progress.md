# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 6 — The `table` block in `rt-ai-chat`
- **Done:** the task is taken, the branch `RT-3337-ai-chat-table-block` is taken from `RT-3336-ai-chat-chart-data` (chain), the task is in progress on the board. Exploration done, the six questions closed by assumption, the mockup approved: «Одобряю макет». The agreement draft `docs/specs/ui-kit-v2/proposed/ai-chat-table/` is written and checked against the grill (`ee8c157d2`); its four open questions are closed by assumption in its Decisions.
- **Next step:** step 3.1, the table block type in the ai-chat model.
- **Going now:** stage 1. The plan is approved by the owner: «Одобряю план с добавками» — the block schema (step 1.7, SC-UKV-1433) and the chart data table on the shared look (step 4.7, SC-UKV-1434). goal-critic's blocking finding is closed by `play` steps of `Wide` and `Scrolled`.
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-3336 (#3402), which stands on RT-3335 (#3398)

## Steps

The plan is approved by the owner; the work goes by its steps.

- [x] 1.1 Write `projects/ui-kit-v2/src/lib/util/table-data.ts`: the column read with a fallback — not an object is a `text` column with an empty label, a non-string `label` an empty head cell, an unknown or missing type `text`; a row that is not a list dropped; a row fitted to the column count (pad with empty, drop past the last); the total fitted the same way, and a `total` that is not a list, `null`, empty or empty after fitting absent; a value that is not a number, a string or `null` an empty cell.
- [x] 1.2 Write the cell format in the same file: `Intl.NumberFormat` for the kit locale with `en` for a refused locale; `number` up to 2 fraction digits with grouping, `percent` 0.25 → 25 with the locale's percent sign up to 1, `currency` by the column code with the digits of that currency, a code that is not three Latin upper-case letters written as `number`; `null`, a missing value, `NaN` and an infinity empty; zero written; a written zero form such as -0.001 without a minus and not coloured; a non-number as given; a number in a `text` column as its plain digits; every cell returns its text, its alignment `start` or `end` and a flag «negative» for a value whose written form is below zero in a number column.
- [x] 1.3 Write `projects/ui-kit-v2/src/lib/util/table-csv.ts`: CSV of the head, rows and total with CRLF under every locale; every head label and every string value a text field whatever its column; a number value as `String(value)`, never prefixed, `NaN` and an infinity empty; the apostrophe before a text field starting with `=`, `+`, `-`, `@`, a tab or a CR, added before quoting; a field with a comma, a double quote, CR or LF in double quotes with the quote doubled; an absent total gives no line.
- [x] 1.4 Write the tab-separated text for the answer copy in the same file: the head, the rows and the total joined by LF with values as the table shows them for a given locale, a tab or a line break in a value or a head label replaced by a space, an absent total gives no line.
- [x] 1.5 Export both files from `projects/ui-kit-v2/src/lib/util/index.ts`.
- [x] 1.6 Write `table-data.spec.ts` and `table-csv.spec.ts` next to them, test names starting with the scenario id: SC-UKV-1398, 1399, 1400, 1401, 1402, 1403, 1410, 1411, 1414, 1421, 1424, 1426, 1427, 1428 at the helper level.
- [x] 1.7 Write `projects/ui-kit-v2/src/lib/util/table.schema.ts`: `RT_AI_CHAT_TABLE_SCHEMA`, JSON Schema 2020-12 of the table block as the chart schema is written; export it; `table.schema.spec.ts` covers SC-UKV-1433 by a hand-written check of the sample blocks against the schema's fields.
- [x] 2.1 Add the column alignment field (`start`, `center`, `end`, one per head cell) to the table node in `projects/ui-kit-v2/src/lib/util/markdown.model.ts`; other block kinds keep it empty.
- [x] 2.2 Read the divider row in `readTable` of `projects/ui-kit-v2/src/lib/util/markdown-parse.ts`: `--:` end, `:-:` centre, `:--` and `---` start, a column with no divider cell start.
- [x] 2.3 Fit every markdown row to the head in `readTable`: a short row padded with empty cells, cells past the head dropped; the plain-text copy follows the fitted node.
- [x] 2.4 Add cases to `markdown-parse.spec.ts` and `markdown-plain-text.spec.ts`: SC-UKV-1416 at the parser level, SC-UKV-1418 at the parser level and for the fitted copy.
- [>] 3.1 Add `IRtAiChat.TableBlock` and the column type to `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts`, and a `table` view kind to `BlockView`.
- [ ] 3.2 Write `isTableBlock` next to `isMarkdownBlock` in `rt-ai-chat-blocks.logic.ts`: `columns` a non-empty list and `rows` a list, otherwise the plate with the type name; malformed parts inside a valid block go to the stage 1 helpers, not to the plate.
- [ ] 3.3 Add `table` to `OWN_TYPES` and to `toBlockViews`, so a renderer registered for `table` is not taken.
- [ ] 3.4 Give `blocksToPlainText` a kit locale argument and the table text by the tab-separated helper of stage 1; `rt-ai-chat-answer.component.ts` reads `RT_KIT_LOCALE` inside the `plainText` computed, so the answer copy follows a locale change.
- [ ] 3.5 Write the shared table look as a mixin in `projects/ui-kit-v2/src/styles/_mixins.scss`: rows at least 28 (27 and a 1 border, as in the chart data table) growing with wrapped text, cell padding 8, 12 px font, bottom borders, the head on the surface background with muted semibold text, both themes on kit tokens, alignment by `text-align: start` and `end`.
- [ ] 3.6 Write the block component `rt-ai-chat-table` in `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/table/`: `<table>` with `thead`, `tbody`, `tfoot` for a present total, `th scope="col"`; the scroll box with `tabindex="0"`, the name «Table», scrolled by the arrow keys, sideways scroll and `max-height: 200px`, the head `position: sticky` on its top; number columns at the end, nowrap, as wide as their widest value; the first `text` column takes the rest, other `text` columns as wide as their content allows, every `text` cell wraps between words; a table with no `text` column as wide as its content; every row drawn, no cap; negatives coloured by `--rt-color-state-error-text`; the total semibold under a `--rt-color-border-default` top border; the `native-ok` marker over `<table>` naming `rt-table`, as the chart data table has it.
- [ ] 3.7 Derive the cells as `computed` signals over the `block` input and `RT_KIT_LOCALE`, so a locale change or a new input writes the values anew while the scroll box element and the «Copied» flag stay with the instance; no getters.
- [ ] 3.8 Add «Copy CSV» under the table: a text button whose accessible name is its text, the CDK `Clipboard`, the CSV of the rows drawn at the press, no read of `streaming`; on success «Copied» with a check for 2000 ms in a polite live region, a press while «Copied» copies again and restarts the 2000 ms, a locale change switches the text without restarting; on a refused copy no change; the flag lives in the component instance.
- [ ] 3.9 Draw the `table` view in `rt-ai-chat-blocks.component.html` by the new component.
- [ ] 3.10 Add the labels `aiTableCopyCsv` («Copy CSV») and `aiTableLabel` («Table») to `rt-kit-labels.en.ts`, «Copied» by the existing `uiCopied`; their Russian texts to `.storybook/showcase-labels.ru.ts` as the mockup writes them, «Скопировано» already there as `uiCopied`.
- [ ] 3.11 Put `qa-dataid` anchors on the block, the scroll box, the head cells, the cells, the total row and the button.
- [ ] 3.12 Write the component spec `rt-ai-chat-table.component.spec.ts` and extend `rt-ai-chat-blocks.logic.spec.ts`, `rt-ai-chat-blocks.component.spec.ts` and the answer spec: SC-UKV-1396, 1397, 1398, 1400, 1401, 1402, 1404, 1405, 1406, 1410, 1411, 1412, 1413, 1414, 1415, 1419, 1420, 1421, 1423, 1424, 1429, 1430, 1431, 1432 at the component level; a styles spec reading the compiled SCSS for `max-height: 200px`, `position: sticky`, `overflow-x: auto` of the box, `text-align: start` and `end`, `min-height` or `height` 28 of a row, the error colour and `--rt-color-border-default`.
- [ ] 4.1 Move the table of `rt-markdown-text.component.scss` onto the shared mixin of stage 3: bottom borders in place of full borders, the same rows, padding, font and head; the sideways scroll in its own box; no maximum height, no sticky head, column widths the browser's.
- [ ] 4.2 Align the head cells and the cells of `rt-markdown-text.component.html` by the column alignment of stage 2, by `start`, `center` and `end`, so `dir="rtl"` mirrors them; no type detection, no formatting, no colour, no total, no «Copy CSV».
- [ ] 4.3 Give the markdown table `th scope="col"` head cells and a scroll box with `tabindex="0"`, scrolled by the arrow keys and named by the kit label `aiTableLabel`.
- [ ] 4.4 Keep the anchors `markdown-table-scroll`, `markdown-table`, `markdown-head-cell`, `markdown-cell`: the admin panel's e2e finds the table by them.
- [ ] 4.5 Extend `rt-markdown-text.component.spec.ts`: SC-UKV-1416 and SC-UKV-1418 at the drawn level, SC-UKV-1417 for «-10» not coloured, no «Copy CSV», `th scope="col"` and the named scroll box; extend `rt-markdown-text.styles.spec.ts` for the bottom borders, `text-align: start` and `end`, no `max-height` and no `position: sticky`.
- [ ] 4.6 Run the admin panel's markup and details-panel e2e specs; a diverged frame of the postmortem panel is looked at and re-taken only if it shows the new table look.
- [ ] 4.7 Move the chart data table of `rt-ai-chat-chart.component.scss` onto the shared mixin, keeping its format function and rows; its frames are re-taken in stage 5; SC-UKV-1434.
- [ ] 5.1 Write the stories `Organisms/Chat/AiChatTable` in `blocks/table/stories/`: `Narrow` (four columns at 328, «Апартаменты у моря» wrapping in one row), `Wide` (twelve columns at 328, a `play` step scrolling the box sideways and asserting `scrollWidth` above `clientWidth`, `scrollLeft` above 0 and the block 328 wide), `AllNumbers` (three short `number` columns at 328), `WithTotal`, `Negatives`, `Scrolled` (a `play` step focusing the box and scrolling it down by the arrow key and asserting the head row top equals the box top), `Copied` (a `play` step pressing «Copy CSV»), `Empty`, `Invalid`, `Markdown` (the block next to a thirty-row markdown table in one answer), `Rtl` (the block and a markdown table under `dir="rtl"`), `Themes` (light and dark), `Playground`.
- [ ] 5.2 Add an aligned table with «-10» to the markdown matrix fixture `test-markdown-text-matrix.component.ts`.
- [ ] 5.3 Write `Overview.mdx` of the block next to it; name the `table` block in the ai-chat `Overview.mdx`.
- [ ] 5.4 Sweep the raised showcase and look at every new frame at 328, in the side panel and at 760+.
- [ ] 5.5 Take the references of the new stories and re-take the markdown and ai-chat ones the look changed: `node tools/visual-gate.mjs ui-kit-v2 --update 'blocks/table'`, then `--update 'markdown-text'`; confirm each by a second raising before the commit.
- [ ] 5.6 Measure the mockup node 8215-449 and the same elements of the showcase, in the light and the dark theme, into two JSON files in the scratchpad and run the numbers match; make the overlay for the owner.
- [ ] 5.7 Write the match line into `approvals.md`, show the showcase to the owner, write the owner's answer word for word as the «Витрина» line.
- [ ] 6.1 Move the agreement into the subdomain `docs/specs/ui-kit-v2/ai-chat-table/` with the same scenario numbers; `implementation.md` gets the bindings `file:symbol` of the written code; the scenarios get their «Covered» marks, the frame-held ones (SC-UKV-1407, 1408, 1409, 1422, 1425, the look part of 1417 and the arrow-key part of 1419) «Not covered: held by the frame of the story …» or «Coverage: partial».
- [ ] 6.2 Edit `docs/specs/ui-kit-v2/ai-chat/spec.md`: the kit's own types name `table` in the two rules, the terminology of the block and the decision about heavy blocks; the out-of-scope line about a table drawn by a registered renderer goes; the answer copy names the kit locale; the attachments line of `ai-chat/CONTEXT.md` follows.
- [ ] 6.3 Remove `docs/specs/ui-kit-v2/proposed/ai-chat-table/`.
- [ ] 6.4 Bring `CONTEXT.md` of ai-chat and of markdown-text to the new block, the alignment, the named scroll box and the shared look; re-read the footprint specs and rules for staleness.
- [ ] 6.5 Run the roles `goal-critic` and `product-strategist` on the result against the owner's words and the points.
- [ ] 6.6 Mark row 5 of `docs/plans/ai-chat-blocks.md`; write the archive record `docs/archive/RT-3337-ai-chat-table-block.md` with the line that the first kit release goes after the chain is merged, by the owner's word of 15.11; take the task folder apart by the last commit before the PR.
- [ ] 6.7 Run the push set, push, open the PR as a draft into `RT-3336-ai-chat-chart-data`.

## Decisions along the way

- The findings of spec-critic are closed by the executor's decisions, none against the grill. One
  touches its reason only: the CSV goes to a file or an import, since pasted comma text is not split
  into cells; pasting into cells is served by the tab-separated answer copy. The format stays CSV,
  as the grill has it.

- The branch is taken from `RT-3336-ai-chat-chart-data`: PRs go in a chain, and RT-3336 is not merged yet.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3337-ai-chat-table-block

### Where we stand at the minute of the compaction

- **State:** `разбор-закрыт`
- **Stage:** 0 of 0 — the agreement
- **Next step:** the product agreement by spec-writer, its review by spec-critic, then the plan and the roles before the owner.
- **PR:** not open yet; the branch stands on RT-3336 (#3402), which stands on RT-3335 (#3398)

The progress in full — `docs/tasks/RT-3337-ai-chat-table-block/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3337-ai-chat-table-block/grill.md
 M docs/tasks/RT-3337-ai-chat-table-block/progress.md
?? docs/tasks/RT-3337-ai-chat-table-block/approvals.md
```

### Commits over the main branch

```
f41139b04 docs(rt:ui-kit-v2): разбор RT-3337 — что есть в дереве и решения по допущению
c732baf28 docs(rt:ui-kit-v2): находки разбора правил по задаче RT-3336
c0c10cf0e docs(rt:ui-kit-v2): задача RT-3337 взята, план эпика отмечает RT-3335 и RT-3336
7a05c724e docs(rt:ui-kit-v2): папка задачи RT-3336 разобрана в архив
016ac1cdd docs(rt:ui-kit-v2): договорённость о таблице данных стала подразделом спеки
07af1d717 test(rt:ui-kit-v2): эталоны витрины с таблицей данных графика
ec8883a8c feat(rt:ui-kit-v2): витрина таблицы данных графика
c294f17a2 feat(rt:ui-kit-v2): кнопка «Показать данные» и таблица под графиком
95463f63c docs(rt:ui-kit-v2): находки разбора правил по задаче RT-3335
975466250 feat(rt:ui-kit-v2): строки таблицы данных из данных графика
55d175566 docs(rt:ui-kit-v2): разбор, план и договорённость таблицы данных графика
f87c1bebc Merge remote-tracking branch 'origin/main' into RT-3335-ai-chat-chart-block
10340e535 fix(rt:ui-kit-v2): шаблон обёртки Playground блока графика в своём файле
ab1a90b4d docs(rt:ui-kit-v2): папка задачи RT-3335 разобрана в архив
0cce1a338 test(rt:ui-kit-v2): входы редактора и графика не тянут друг друга
846f5993b docs(rt:ui-kit-v2): задача RT-2750 влита в эпик блоков ответа
68079bf9b Merge remote-tracking branch 'origin/RT-3346-ai-chat-blocks' into RT-3335-ai-chat-chart-block
46d233f00 [RT-2750] Во втором ките есть компонент графика rt-chart (#3386)
317ab68bc docs(rt:ui-kit-v2): договорённость о блоке графика стала подразделом спеки
80db7de02 fix(rt:ui-kit-v2): подписи блока графика по высоте строки макета
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
