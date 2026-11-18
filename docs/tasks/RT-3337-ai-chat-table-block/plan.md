# Plan

**Task:** RT-3337 · **Branch:** RT-3337-ai-chat-table-block, from `RT-3336-ai-chat-chart-data`; its PR goes into that branch (chain)
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-table/`
**Behaviour:** changes

## Points

- **A:** a table in an assistant answer arrives as markdown, and `rt-markdown-text` draws it with
  its own markup: full borders, every column aligned left, currencies and percents as raw text, no
  head that stays on top. `rt-ai-chat` has no `table` block; an application draws a table by its
  own template.
- **This task reaches:** an answer block `table` drawn by the kit without registration — typed
  columns aligned by type, values written for the kit locale, negatives in the error text colour,
  a sticky head in a scroll box 200 high at most, an optional total row, «Copy CSV»; a markdown
  table in the same look, aligned by its divider row.
- **Sign:** the showcase stories `Organisms/Chat/AiChatTable` — narrow 328, wide 12 columns, all
  numbers, with a total, with negatives, scrolled, copied, empty, invalid, markdown, right-to-left,
  dark — and the markdown story `Molecules/MarkdownText` with an aligned table; the owner sees them
  in the showcase and approves them. The numbers of the block match the mockup node 8215-449 at N
  of N.
- **Milestone G of the epic:** the published kit draws the answer «обзор месяца» (a total, 4 KPI,
  2 charts, a table) by one `blocks` array without an application template. This task gives the
  table of that answer; the first kit release goes after it by the owner's word «После 3337 + в
  конце».
- **Incidental point:** the tables of the admin panel, drawn by `rt-markdown-text`, take the new
  look, and its e2e finds them by the same anchors (step 4.6).
- **Metric:** нет: a kit feature, not an improvement of a rule, a hook, a check or a role.

## Task footprint

| What  | Where                                                                                                                                                                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-table/` → `docs/specs/ui-kit-v2/ai-chat-table/`                                                                                                                                                                                  |
| Specs | `docs/specs/ui-kit-v2/ai-chat/spec.md` — the kit's own types, the out-of-scope line about a table                                                                                                                                                                       |
| Specs | `docs/specs/ui-kit-v2/ai-chat-chart-data/spec.md` — names RT-3337 as the task taking its markup; read                                                                                                                                                                   |
| Laws  | `docs/constitution/frontend-application.md`, `reuse-first.md`, `verifiability.md`                                                                                                                                                                                       |
| Rules | `.claude/skills/component-structure/`, `styling-bem/`, `rt-tools-styling/`, `rt-tools-storybook/`                                                                                                                                                                       |
| Rules | `.claude/skills/ui-component-tests/`, `testing/`, `kit-approval/`, `reuse-first/`, `spec-driven/`                                                                                                                                                                       |
| Code  | `projects/ui-kit-v2/src/lib/util/` — the core entry `@rt-tools/ui-kit-v2/core` (`src/lib/core.ts`)                                                                                                                                                                      |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/` — the entry `@rt-tools/ui-kit-v2/rich-editor`                                                                                                                                                              |
| Code  | `projects/ui-kit-v2/src/lib/components/markdown-text/`, `projects/ui-kit-v2/src/styles/_mixins.scss`                                                                                                                                                                    |
| Code  | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts`, `projects/ui-kit-v2/.storybook/showcase-labels.ru.ts`                                                                                                                                                            |
| Code  | the admin panel draws `rt-markdown-text` from source: `libs/message-bus-admin/*/ui` postmortem, proposal and month record views; its e2e `apps/message-bus-admin-e2e/src/markup-text.spec.ts` holds the anchors `markdown-table`, `markdown-head-cell`, `markdown-cell` |

No contract, no storage migration, no SEO: the kit is a package, the block keeps no data.

## What counts as done

- A `table` block is drawn by the kit in `rt-ai-chat` without registration; a renderer registered
  for `table` is not used; malformed parts of a valid block are dropped or emptied, a broken block
  is the plate.
- A 12-column table scrolls sideways inside the block at 328; the block and the feed keep their
  width; an all-number table is as wide as its content; every given row is drawn.
- Number columns stand at the end, `text` columns at the start, mirrored under `dir="rtl"`; values
  are written by `Intl.NumberFormat` for the kit locale, `en` for a refused one, and follow its
  change; a value written below zero takes `--rt-color-state-error-text`, a zero form does not.
- The head stays on top while the rows scroll in a box 200 high at most; the total row stands in
  `tfoot`, semibold, under a `--rt-color-border-default` border, and an empty total is absent.
- «Copy CSV» puts CRLF-separated CSV with escaping, raw numbers and the formula prefix on head
  labels and string values into the clipboard, also while the answer is written, and shows «Copied»
  for two seconds; a new input keeps the scroll and «Copied»; the answer copy gives the table as
  tab-separated lines joined by LF in the kit locale of the moment.
- A markdown table takes the same look, aligned by its divider row, its rows fitted to the head,
  `th scope="col"` and a scroll box named «Table»; the admin panel's e2e anchors stay.
- The showcase has the stories narrow, wide, all numbers, with a total, with negatives, scrolled,
  copied, empty, invalid, markdown, right-to-left, dark; their numbers match the mockup at N of N;
  the owner approved the showcase.
- The 37 scenarios SC-UKV-1396…1432 live in `docs/specs/ui-kit-v2/ai-chat-table/`; every one has a
  test except those held by a story frame, which carry «Not covered: held by the frame of …».

## Stages

### 1. Pure helpers of the table in the core entry

- **Steps:**
    1. Write `projects/ui-kit-v2/src/lib/util/table-data.ts`: the column read with a fallback — not an object is a `text` column with an empty label, a non-string `label` an empty head cell, an unknown or missing type `text`; a row that is not a list dropped; a row fitted to the column count (pad with empty, drop past the last); the total fitted the same way, and a `total` that is not a list, `null`, empty or empty after fitting absent; a value that is not a number, a string or `null` an empty cell.
    2. Write the cell format in the same file: `Intl.NumberFormat` for the kit locale with `en` for a refused locale; `number` up to 2 fraction digits with grouping, `percent` 0.25 → 25 with the locale's percent sign up to 1, `currency` by the column code with the digits of that currency, a code that is not three Latin upper-case letters written as `number`; `null`, a missing value, `NaN` and an infinity empty; zero written; a written zero form such as -0.001 without a minus and not coloured; a non-number as given; a number in a `text` column as its plain digits; every cell returns its text, its alignment `start` or `end` and a flag «negative» for a value whose written form is below zero in a number column.
    3. Write `projects/ui-kit-v2/src/lib/util/table-csv.ts`: CSV of the head, rows and total with CRLF under every locale; every head label and every string value a text field whatever its column; a number value as `String(value)`, never prefixed, `NaN` and an infinity empty; the apostrophe before a text field starting with `=`, `+`, `-`, `@`, a tab or a CR, added before quoting; a field with a comma, a double quote, CR or LF in double quotes with the quote doubled; an absent total gives no line.
    4. Write the tab-separated text for the answer copy in the same file: the head, the rows and the total joined by LF with values as the table shows them for a given locale, a tab or a line break in a value or a head label replaced by a space, an absent total gives no line.
    5. Export both files from `projects/ui-kit-v2/src/lib/util/index.ts`.
    6. Write `table-data.spec.ts` and `table-csv.spec.ts` next to them, test names starting with the scenario id: SC-UKV-1398, 1399, 1400, 1401, 1402, 1403, 1410, 1411, 1414, 1421, 1424, 1426, 1427, 1428 at the helper level.
    7. Write `projects/ui-kit-v2/src/lib/util/table.schema.ts`: `RT_AI_CHAT_TABLE_SCHEMA`, JSON Schema 2020-12 of the table block as the chart schema is written; export it; `table.schema.spec.ts` covers SC-UKV-1433 by a hand-written check of the sample blocks against the schema's fields.
- **Readiness sign:** the three specs pass and hold every helper rule; the core entry exports them.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/util/table --output-style=static` — now prints «No tests found, exiting with code 0»; ready when it prints «Test Suites: 3 passed, 3 total» and the test names carry SC-UKV-1398…1403, 1410, 1411, 1414, 1421, 1424, 1426, 1427, 1428.

### 2. The markdown parser reads the divider alignment and fits rows

- **Steps:**
    1. Add the column alignment field (`start`, `center`, `end`, one per head cell) to the table node in `projects/ui-kit-v2/src/lib/util/markdown.model.ts`; other block kinds keep it empty.
    2. Read the divider row in `readTable` of `projects/ui-kit-v2/src/lib/util/markdown-parse.ts`: `--:` end, `:-:` centre, `:--` and `---` start, a column with no divider cell start.
    3. Fit every markdown row to the head in `readTable`: a short row padded with empty cells, cells past the head dropped; the plain-text copy follows the fitted node.
    4. Add cases to `markdown-parse.spec.ts` and `markdown-plain-text.spec.ts`: SC-UKV-1416 at the parser level, SC-UKV-1418 at the parser level and for the fitted copy.
- **Readiness sign:** the parser gives the alignment and fitted rows, and the copy carries the fitted rows; the existing 31 parser tests and 7 plain-text tests stay green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/util/markdown- --output-style=static` — now «Tests: 38 passed, 38 total» over 2 suites; ready when the count grows by the new cases, all passed, and the names carry SC-UKV-1416 and SC-UKV-1418.

### 3. The `table` block in `rt-ai-chat`

- **Steps:**
    1. Add `IRtAiChat.TableBlock` and the column type to `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts`, and a `table` view kind to `BlockView`.
    2. Write `isTableBlock` next to `isMarkdownBlock` in `rt-ai-chat-blocks.logic.ts`: `columns` a non-empty list and `rows` a list, otherwise the plate with the type name; malformed parts inside a valid block go to the stage 1 helpers, not to the plate.
    3. Add `table` to `OWN_TYPES` and to `toBlockViews`, so a renderer registered for `table` is not taken.
    4. Give `blocksToPlainText` a kit locale argument and the table text by the tab-separated helper of stage 1; `rt-ai-chat-answer.component.ts` reads `RT_KIT_LOCALE` inside the `plainText` computed, so the answer copy follows a locale change.
    5. Write the shared table look as a mixin in `projects/ui-kit-v2/src/styles/_mixins.scss`: rows at least 28 (27 and a 1 border, as in the chart data table) growing with wrapped text, cell padding 8, 12 px font, bottom borders, the head on the surface background with muted semibold text, both themes on kit tokens, alignment by `text-align: start` and `end`.
    6. Write the block component `rt-ai-chat-table` in `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/table/`: `<table>` with `thead`, `tbody`, `tfoot` for a present total, `th scope="col"`; the scroll box with `tabindex="0"`, the name «Table», scrolled by the arrow keys, sideways scroll and `max-height: 200px`, the head `position: sticky` on its top; number columns at the end, nowrap, as wide as their widest value; the first `text` column takes the rest, other `text` columns as wide as their content allows, every `text` cell wraps between words; a table with no `text` column as wide as its content; every row drawn, no cap; negatives coloured by `--rt-color-state-error-text`; the total semibold under a `--rt-color-border-default` top border; the `native-ok` marker over `<table>` naming `rt-table`, as the chart data table has it.
    7. Derive the cells as `computed` signals over the `block` input and `RT_KIT_LOCALE`, so a locale change or a new input writes the values anew while the scroll box element and the «Copied» flag stay with the instance; no getters.
    8. Add «Copy CSV» under the table: a text button whose accessible name is its text, the CDK `Clipboard`, the CSV of the rows drawn at the press, no read of `streaming`; on success «Copied» with a check for 2000 ms in a polite live region, a press while «Copied» copies again and restarts the 2000 ms, a locale change switches the text without restarting; on a refused copy no change; the flag lives in the component instance.
    9. Draw the `table` view in `rt-ai-chat-blocks.component.html` by the new component.
    10. Add the labels `aiTableCopyCsv` («Copy CSV») and `aiTableLabel` («Table») to `rt-kit-labels.en.ts`, «Copied» by the existing `uiCopied`; their Russian texts to `.storybook/showcase-labels.ru.ts` as the mockup writes them, «Скопировано» already there as `uiCopied`.
    11. Put `qa-dataid` anchors on the block, the scroll box, the head cells, the cells, the total row and the button.
    12. Write the component spec `rt-ai-chat-table.component.spec.ts` and extend `rt-ai-chat-blocks.logic.spec.ts`, `rt-ai-chat-blocks.component.spec.ts` and the answer spec: SC-UKV-1396, 1397, 1398, 1400, 1401, 1402, 1404, 1405, 1406, 1410, 1411, 1412, 1413, 1414, 1415, 1419, 1420, 1421, 1423, 1424, 1429, 1430, 1431, 1432 at the component level; a styles spec reading the compiled SCSS for `max-height: 200px`, `position: sticky`, `overflow-x: auto` of the box, `text-align: start` and `end`, `min-height` or `height` 28 of a row, the error colour and `--rt-color-border-default`.
- **Readiness sign:** the block is drawn by the kit, its specs pass, the rich-editor entry still does not pull the chart entry, and no new bypass of the ready-made is counted.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/rich-editor/lib/components/ai-chat --output-style=static` — now «Test Suites: 5 passed», «Tests: 39 passed, 39 total»; ready when the suites and tests grow, all passed, and the names carry the ids above; `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/ai-chat-chart/lib/ai-chat-chart.entries.spec.ts --output-style=static` — now and after «Tests: 1 passed, 1 total»; `node tools/check-reuse.mjs` — now «accepted 211, debt 0, no new ones», ready when it still prints «no new ones»; `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — exit 0, the Russian label set complete by its `Record<TRtKitLabelKey, string>` type.

### 4. The markdown table in the block's look

- **Steps:**
    1. Move the table of `rt-markdown-text.component.scss` onto the shared mixin of stage 3: bottom borders in place of full borders, the same rows, padding, font and head; the sideways scroll in its own box; no maximum height, no sticky head, column widths the browser's.
    2. Align the head cells and the cells of `rt-markdown-text.component.html` by the column alignment of stage 2, by `start`, `center` and `end`, so `dir="rtl"` mirrors them; no type detection, no formatting, no colour, no total, no «Copy CSV».
    3. Give the markdown table `th scope="col"` head cells and a scroll box with `tabindex="0"`, scrolled by the arrow keys and named by the kit label `aiTableLabel`.
    4. Keep the anchors `markdown-table-scroll`, `markdown-table`, `markdown-head-cell`, `markdown-cell`: the admin panel's e2e finds the table by them.
    5. Extend `rt-markdown-text.component.spec.ts`: SC-UKV-1416 and SC-UKV-1418 at the drawn level, SC-UKV-1417 for «-10» not coloured, no «Copy CSV», `th scope="col"` and the named scroll box; extend `rt-markdown-text.styles.spec.ts` for the bottom borders, `text-align: start` and `end`, no `max-height` and no `position: sticky`.
    6. Run the admin panel's markup and details-panel e2e specs; a diverged frame of the postmortem panel is looked at and re-taken only if it shows the new table look.
    7. Move the chart data table of `rt-ai-chat-chart.component.scss` onto the shared mixin, keeping its format function and rows; its frames are re-taken in stage 5; SC-UKV-1434.
- **Readiness sign:** the markdown table is aligned by its divider, read as a table and has the block's look; the admin panel finds its table by the same anchors.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/markdown-text --output-style=static` — now «Tests: 20 passed, 20 total» over 2 suites; ready when the count grows, all passed, names carry SC-UKV-1416, 1417, 1418; `pnpm exec nx run message-bus-admin-e2e:e2e src/markup-text.spec.ts src/details-panel.spec.ts` — every test passed, SC-MB-211 among them.

### 5. The showcase, its snapshots, the match with the mockup

- **Steps:**
    1. Write the stories `Organisms/Chat/AiChatTable` in `blocks/table/stories/`: `Narrow` (four columns at 328, «Апартаменты у моря» wrapping in one row), `Wide` (twelve columns at 328, a `play` step scrolling the box sideways and asserting `scrollWidth` above `clientWidth`, `scrollLeft` above 0 and the block 328 wide), `AllNumbers` (three short `number` columns at 328), `WithTotal`, `Negatives`, `Scrolled` (a `play` step focusing the box and scrolling it down by the arrow key and asserting the head row top equals the box top), `Copied` (a `play` step pressing «Copy CSV»), `Empty`, `Invalid`, `Markdown` (the block next to a thirty-row markdown table in one answer), `Rtl` (the block and a markdown table under `dir="rtl"`), `Themes` (light and dark), `Playground`.
    2. Add an aligned table with «-10» to the markdown matrix fixture `test-markdown-text-matrix.component.ts`.
    3. Write `Overview.mdx` of the block next to it; name the `table` block in the ai-chat `Overview.mdx`.
    4. Sweep the raised showcase and look at every new frame at 328, in the side panel and at 760+.
    5. Take the references of the new stories and re-take the markdown and ai-chat ones the look changed: `node tools/visual-gate.mjs ui-kit-v2 --update 'blocks/table'`, then `--update 'markdown-text'`; confirm each by a second raising before the commit.
    6. Measure the mockup node 8215-449 and the same elements of the showcase, in the light and the dark theme, into two JSON files in the scratchpad and run the numbers match; make the overlay for the owner.
    7. Write the match line into `approvals.md`, show the showcase to the owner, write the owner's answer word for word as the «Витрина» line.
- **Readiness sign:** every new story is drawn and shot, the frames match their references, the numbers match the mockup N of N, and both approvals stand.
- **Verified by:** `pnpm run test:stories:v2` — no empty showing and no console error, the story count up by the new stories; `node tools/visual-gate.mjs ui-kit-v2` — exit 0, no diverged frame, no story without a reference; `node tools/kit-match.mjs numbers <figma.json> <showcase.json>` — «- **Совпадение:** N из N чисел», exit 0; `node tools/check-kit-approval.mjs` — now names the missing «Совпадение» and «Витрина» lines of `docs/tasks/RT-3337-ai-chat-table-block/approvals.md`; ready when it names no fault; `node tools/verify-ui-kit-v2-docs.cjs` — now «Overview pages matched: 114, no divergences»; ready at 115 with no divergences; `node tools/check-kit-coverage.mjs` — the new component counted as the subject of a story.

### 6. Closing

- **Steps:**
    1. Move the agreement into the subdomain `docs/specs/ui-kit-v2/ai-chat-table/` with the same scenario numbers; `implementation.md` gets the bindings `file:symbol` of the written code; the scenarios get their «Covered» marks, the frame-held ones (SC-UKV-1407, 1408, 1409, 1422, 1425, the look part of 1417 and the arrow-key part of 1419) «Not covered: held by the frame of the story …» or «Coverage: partial».
    2. Edit `docs/specs/ui-kit-v2/ai-chat/spec.md`: the kit's own types name `table` in the two rules, the terminology of the block and the decision about heavy blocks; the out-of-scope line about a table drawn by a registered renderer goes; the answer copy names the kit locale; the attachments line of `ai-chat/CONTEXT.md` follows.
    3. Remove `docs/specs/ui-kit-v2/proposed/ai-chat-table/`.
    4. Bring `CONTEXT.md` of ai-chat and of markdown-text to the new block, the alignment, the named scroll box and the shared look; re-read the footprint specs and rules for staleness.
    5. Run the roles `goal-critic` and `product-strategist` on the result against the owner's words and the points.
    6. Mark row 5 of `docs/plans/ai-chat-blocks.md`; write the archive record `docs/archive/RT-3337-ai-chat-table-block.md` with the line that the first kit release goes after the chain is merged, by the owner's word of 15.11; take the task folder apart by the last commit before the PR.
    7. Run the push set, push, open the PR as a draft into `RT-3336-ai-chat-chart-data`.
- **Readiness sign:** the agreement lives in the domain spec, no proposed folder is left, every scenario is covered or held by a named frame, the push set is green and the PR is open.
- **Verified by:** `pnpm run check:specs 2>&1 | grep -c "proposed/ai-chat-table"` — now 37; ready at 0, and `pnpm run check:specs 2>&1 | grep "ai-chat-table/"` lists only the frame-held scenarios; `node tools/check-work-steps.mjs` — «the steps of the plan and of the progress match»; `node tools/check-spec-coverage.mjs` — «every resource the package carries is spoken of by a spec»; `node tools/check-push-gate.mjs` — green; the PR number named by `/opt/homebrew/bin/gh pr view --json number,baseRefName` with the base `RT-3336-ai-chat-chart-data`.

## Rules of the agreement and where they are checked

| Rule of the agreement                                                                    | Stage · step               | Check                                                                |
| ---------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `table` is a kit type; a renderer for `table` is not taken                               | 3 · 3                      | SC-UKV-1396                                                          |
| `columns`, `rows`, optional `total`; the column fields                                   | 3 · 1                      | typecheck; SC-UKV-1406                                               |
| a broken block is the plate                                                              | 3 · 2                      | SC-UKV-1405; story `Invalid`                                         |
| malformed parts of a valid block are dropped or emptied                                  | 1 · 1, 3 · 2               | SC-UKV-1402                                                          |
| an unknown or missing column type is `text`                                              | 1 · 1                      | SC-UKV-1403                                                          |
| short rows padded, long rows cut, the total too                                          | 1 · 1                      | SC-UKV-1402                                                          |
| an empty total is absent: no `tfoot`, no CSV line, no copy line                          | 1 · 1, 1 · 3, 1 · 4, 3 · 6 | SC-UKV-1424                                                          |
| empty `rows` keep the head, a present total and «Copy CSV»                               | 3 · 6                      | SC-UKV-1404; story `Empty`                                           |
| every row drawn, no cap                                                                  | 3 · 6                      | SC-UKV-1432                                                          |
| a new input keeps the scroll position and «Copied»                                       | 3 · 7                      | SC-UKV-1429                                                          |
| «Copy CSV» stands while the answer is written, copies the drawn rows                     | 3 · 8                      | SC-UKV-1430                                                          |
| `Intl.NumberFormat` by type: grouping, percent, currency digits                          | 1 · 2                      | SC-UKV-1398, SC-UKV-1426                                             |
| the kit locale, `en` for a refused one                                                   | 1 · 2                      | SC-UKV-1398, SC-UKV-1427                                             |
| `currency` without three Latin upper-case letters is `number`                            | 1 · 2                      | SC-UKV-1399                                                          |
| a non-number stands as given, aligned, not coloured                                      | 1 · 2, 3 · 6               | SC-UKV-1401                                                          |
| `null`, missing, `NaN`, infinity empty; zero written                                     | 1 · 2                      | SC-UKV-1402, SC-UKV-1428, SC-UKV-1400                                |
| a number in a `text` column is plain digits                                              | 1 · 2                      | SC-UKV-1403                                                          |
| the minus is the locale's                                                                | 1 · 2                      | SC-UKV-1400                                                          |
| a written zero form has no minus and no colour                                           | 1 · 2                      | SC-UKV-1428                                                          |
| a value written below zero, the total included, in `--rt-color-state-error-text`         | 1 · 2, 3 · 6               | SC-UKV-1400; styles spec; story `Negatives`                          |
| a drawn table follows the locale                                                         | 3 · 7                      | SC-UKV-1415                                                          |
| number columns at the end, `text` at the start, head as its column, mirrored in rtl      | 3 · 5, 3 · 6               | SC-UKV-1397; styles spec; story `Rtl`                                |
| number column width and nowrap                                                           | 3 · 6                      | SC-UKV-1409 frame `Narrow`; kit-match                                |
| `text` column widths, wrap between words; all-number table as wide as its content        | 3 · 6                      | SC-UKV-1409 frame `Narrow`; SC-UKV-1422 frame `AllNumbers`           |
| a wider table scrolls sideways inside the box                                            | 3 · 6                      | SC-UKV-1407 frame `Wide`                                             |
| the box 200 high at most, the head sticky                                                | 3 · 6                      | SC-UKV-1408 frame `Scrolled`; styles spec                            |
| the total after the rows, semibold, `--rt-color-border-default` border, scrolls          | 3 · 6                      | SC-UKV-1406; styles spec; story `WithTotal`                          |
| rows at least 28 and growing, padding 8, 12 px, the head look, both themes               | 3 · 5                      | SC-UKV-1409, SC-UKV-1425 frames `Narrow`, `Themes`; kit-match N of N |
| «Copy CSV» gives CSV with CRLF under every locale                                        | 1 · 3, 3 · 8               | SC-UKV-1410, SC-UKV-1411 in `ru`                                     |
| every head label and string value is a text field                                        | 1 · 3                      | SC-UKV-1421                                                          |
| CSV quoting                                                                              | 1 · 3                      | SC-UKV-1410                                                          |
| numbers as `String(value)`                                                               | 1 · 3                      | SC-UKV-1411, SC-UKV-1428                                             |
| the apostrophe before a formula-like text field, before quoting, never a number          | 1 · 3                      | SC-UKV-1421                                                          |
| «Copied» for two seconds; a refused copy leaves the button                               | 3 · 8                      | SC-UKV-1412, SC-UKV-1413; story `Copied`                             |
| a repeat press restarts the two seconds, a locale change does not                        | 3 · 8, 3 · 10              | SC-UKV-1431 («Скопировано» from the showcase `uiCopied`)             |
| the answer copy as tab-separated lines by LF in the kit locale of the moment             | 1 · 4, 3 · 4               | SC-UKV-1414, SC-UKV-1423                                             |
| the markdown divider alignment, mirrored in rtl                                          | 2 · 2, 4 · 2               | SC-UKV-1416; story `Rtl`                                             |
| the markdown table takes the block's look, no max height, no sticky head, browser widths | 3 · 5, 4 · 1               | SC-UKV-1417 frame; styles spec                                       |
| markdown detects no type, no total, no «Copy CSV»                                        | 4 · 2                      | SC-UKV-1417                                                          |
| a markdown row fitted to the head, the copy carries it                                   | 2 · 3                      | SC-UKV-1418                                                          |
| block: `thead`, `tbody`, `tfoot`, `th scope="col"`                                       | 3 · 6                      | SC-UKV-1419                                                          |
| markdown head cells `th scope="col"`                                                     | 4 · 3                      | SC-UKV-1417                                                          |
| both scroll boxes reachable by Tab, named «Table», scrolled by arrows                    | 3 · 6, 4 · 3               | SC-UKV-1419, SC-UKV-1417; story `Scrolled` play step                 |
| the button's name is its text; «Copied» announced politely                               | 3 · 8                      | SC-UKV-1412                                                          |
| «Copy CSV», «Copied», «Table» are `rtKit` labels, English in the package                 | 3 · 10                     | SC-UKV-1419; typecheck                                               |
| several blocks keep their own «Copied» and scroll box                                    | 3 · 7, 3 · 8               | SC-UKV-1420                                                          |

## What this work does not do

- Sorting, filtering, pagination, column settings, narrow-screen cards, editing, a total computed
  by the kit — out of the agreement.
- «Copy CSV» under a markdown table and type detection in a markdown table — out of the agreement.
- Moving the chart data table of RT-3336 onto the shared mixin: the chart keeps its styles and its
  format function; if the two looks diverge, a task in the queue.
- The kit release: the first release after RT-3337 is a separate action by the owner's word, after
  the chain is merged.
- `rt-table` and `rt-data-table` are not touched.
