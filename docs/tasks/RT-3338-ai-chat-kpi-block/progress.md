# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — The showcase and the match with the mockup
- **Done:** stage 3 — the `kpi` type, view, copy line and the `rt-ai-chat-kpi` component; the delta writer moved to `delta-number.ts` and serves the tile and the copy: `nx test --testFile=src/rich-editor/lib/components/ai-chat` 93 passed of 93 (logic 19), stat-tile 37, util 81, lint, stylelint, `check:tokens-styles`, `check:cascade-layer` and typecheck green. Stage 2 — the tile writes both delta rows by `RT_KIT_LOCALE`, has `size="compact"` and `deltaLabelVisible`: `nx test --testFile=src/lib/components/stat-tile` 37 passed of 37, lint, stylelint, `check:tokens-styles` and typecheck green; `node tools/visual-gate.mjs ui-kit-v2` — 1159 snapshots of 1159 matched, the tile references needed no retake. Stage 1 — `kpi-data.ts`, `kpi.schema.ts`, their specs: `nx test --testFile=src/lib/util/kpi` 13 passed of 13, the table util specs 22 of 22, typecheck green. Before it: the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3338-ai-chat-kpi-block` from `RT-3337-ai-chat-table-block` (chain), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption. The mockup is approved. The agreement holds SC-UKV-1436…1483, committed. The plan is written and reviewed by product-strategist and goal-critic; their findings are closed in the plan.
- **Next step:** step 4.1 — the stories of the block by the agreement's table «Screens and states».
- **Uncommitted:** no
- **Waiting for the owner:** no; the plan is approved: «Одобряю план»
- **PR:** not open yet; the branch stands on RT-3337 (#3407), which stands on RT-3336 (#3402) and RT-3335 (#3398)

## Steps

- [x] 1.1 Write the lenient data function of a KPI item and block in `kpi-data.ts` next to `table-data.ts`: missing value and label, format, currency, delta, deltaUnit, base, period, growthIsGood.
- [x] 1.2 Write the value writer in `kpi-data.ts` on top of `rtTableCellWriter`: the short form from a million with 0–2 fraction digits and trailing zeros dropped, rounding to a million written short.
- [x] 1.3 Write the JSON schema of the block in `kpi.schema.ts` next to `table.schema.ts` and export both from the util barrel.
- [x] 1.4 Write the specs of the data function, the writer and the schema with the scenario numbers of the agreement: SC-UKV-1440–1447, 1459, 1476, 1482, 1483.
- [x] 2.1 Write both delta rows of `rt-stat-tile` by `Intl.NumberFormat` for the kit label locale: a plus on growth, at most one fraction digit, direction by the written number, `en` for a refused locale.
- [x] 2.2 Add the compact size: value 24/24, delta 14, delta on its own line, inner gaps 6, wrapping secondary and base caption.
- [x] 2.3 Add the option that shows the primary delta label as visible text without a duplicate `title`.
- [x] 2.4 Name the locale in the existing tile specs and add the specs of the new scenarios: SC-UKV-1453–1456, 1466–1471.
- [x] 2.5 Run the tile story snapshots and take anew the references whose delta text changed.
- [x] 3.1 Add the `KpiBlock` type, the `kpi` view, `kpi` in `OWN_TYPES` and the data step in `toBlockViews`.
- [x] 3.2 Write the `rt-ai-chat-kpi` component: a list of framed compact tiles, the grid by a block-local container query (one column below 328, two from 328, four from 664), tokens only.
- [x] 3.3 Add the `kpi` case to the blocks template and the copy line to `blockText`.
- [x] 3.4 Write the specs of the block component, the logic, the copy and the styles spec `rt-ai-chat-kpi.styles.spec.ts` (thresholds 328 and 664, the gap, the frame tokens): SC-UKV-1436, 1448–1452, 1457, 1458, 1462, 1463, 1475, 1477, 1478, 1480, 1481.
- [>] 4.1 Write the stories of the block by the agreement's table «Screens and states» (328, 386, 728, deltas, growth is worse, short form, no delta, odd count, below 328, right to left, invalid, dark theme), plus 663/664, long texts, empty and several blocks; and a compact story of the tile.
- [ ] 4.2 Write the chat stories with an answer of four cards (+, −, 0): the narrow panel, the full-screen mode of the default width and the full-screen mode with a 40rem reading column.
- [ ] 4.3 Write the play steps that measure by `getBoundingClientRect` the columns, the card widths, one top per row, no text past its card and no feed widening: SC-UKV-1437–1439, 1460, 1461, 1464, 1472–1474, 1479.
- [ ] 4.4 Write the `Overview.mdx` of the block and name the block in the chat Overview.
- [ ] 4.5 Look at every story live, take the references, sweep all the stories.
- [ ] 4.6 Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress, show the showcase to the owner and write their word into `approvals.md`.
- [ ] 5.1 Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-kpi/` with its bindings; edit the stat-tile and chat specs and the kit spec indexes as the agreement names.
- [ ] 5.2 Bring `CONTEXT.md` of ai-chat and stat-tile up to the block and the tile edits.
- [ ] 5.3 Run the roles goal-critic and product-strategist on the result.
- [ ] 5.4 Mark row 6 of the epic plan, write the archive record, take the task folder apart.
- [ ] 5.5 Run the push set, push, open the PR into `RT-3337-ai-chat-table-block`; its body says it merges only after #3407, so the block and the tile edit do not ride the first release.

## Decisions along the way

- **The branch is taken from `RT-3337-ai-chat-table-block`** — PRs of the epic go in a chain, and #3407 is not merged yet.

- **`rt-stat-tile` measured in the showcase before the mockup** (story `Framed`, light theme, the
  first tile, 232 wide): label 14/normal 600, head height 17; value 32/32 700, «1 240 000 ₽» is 192
  wide; the value row gap 16, it wraps the delta under the value; delta 16/16 700, success colour
  rgb(5,150,105), arrow gap 4; year chip 12/12 600 on rgb(236,253,245), padding 2 8, radius 4;
  baseline line 14/normal 400 rgb(103,103,103); the whole tile 114 high. The frame around it is the
  story's own `article`: padding 24, radius 15, white. **Finding:** two columns in a 328 block leave
  about 156 for a tile, less than the 192 of a 32 px value; the mockup decides the value size of the
  KPI card, and a tile size option, if needed, is added to the tile itself. Affected stage: the
  mockup, before the plan.

- **spec-critic returned 14 findings on the agreement; all are closed by the executor's
  decisions, none against the grill.** The costliest: the tile delta by the kit locale changes the
  tile text for every consumer (default `en` «+12.5%», `ru` with U+00A0), so the stat-tile spec rule,
  SC-UKV-1125 and the tile tests are rewritten at the merge; the compact size puts the delta on its
  own line and lets the period wrap; the short form drops trailing zeros («1 млн ₽»); the card frame
  takes tokens only; RTL isolates the numbers; full-screen narrower than 664 gives two columns and a
  block narrower than 328 one. spec-writer edits the agreement. Affected stage: the agreement.

- **The mockup is drawn and approved:** https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8246-607 —
  four cards at 328 and 386 (two columns) and 728 (four columns) in the light theme, 328 and 728 in
  the dark. A card is framed by the block (border 1, radius 12, padding 12, gap 6; the tile draws no
  frame); label 14 SemiBold, value 24/24 Bold, delta 14 Bold with the arrow and the visible base
  caption 12 Regular muted, period 12 Regular muted; grid gap 8. A value of a million and more is
  written short («1,24 млн ₽»), below that in full («8 400 ₽»). Measured: cards 160 at 328, 189 at
  386, 176 at 728; one top per row; no text past its card; the frame overlaps no other frame on the
  sheet. The owner's word: «Одобряю макет».

- **product-strategist and goal-critic on the plan: 9 findings, all closed in the plan before the
  owner's word.** The sign of stage 4 checked only empty showings — now the snapshots
  (`test:visual:v2`), play steps measuring columns and widths, the table «mockup / showcase» and the
  owner's word in `approvals.md`. The task card's «four in full screen» had no chat story — now the
  narrow panel and the full-screen mode stories (4.2). A full-screen chat with a 40rem reading column
  gives the block 640, below 664: two columns, as SC-UKV-1472 of the agreement already says; the
  threshold stays 664, because at 640 a card would get 154 instead of the approved 160. The styles
  spec of the block (3.4) and the retaking of the tile references (2.5) are added; the file names
  `kpi-data.ts` and `kpi.schema.ts` are named; the scenarios are split by stages; the PR merges only
  after #3407, so KPI does not ride the first release; the point is narrowed to the showcase, the
  reader of an answer gets it with milestone G. Affected stage: the plan, before stage 1.

- **The snapshots are taken by `node tools/visual-gate.mjs ui-kit-v2`, not by `pnpm run
  test:visual:v2`** that the plan names in stage 4. The latter, run outside the image, refuses with
  «only the image browser takes the showcase frames»; the gate raises the image itself. Stage 4 is
  verified by the gate. Affected stage: 4.

- **The task is led by the task delivery loop from here on** — the owner merged it into `main` and
  said: «влил пр, подтяни свежий main и дальше работай по процессу с циклами ревью». The fresh
  `main` is merged into this branch (`1737ba4d0`). After stage 4 (the live check in the showcase)
  come two review rounds — `qa-engineer`, `product-strategist` and `goal-critic` in one message, the
  fixes of each round as one commit named by the round — and only then the closing of stage 5; the
  push set runs once, after round two. Step 5.3 of the plan becomes the second round. Affected
  stages: 4 and 5.

- **The tile delta text in `ru` changed only by the space kind** (U+00A0 instead of a plain space
  before «%»), which draws the same pixels: no tile reference diverged. Affected step: 2.5.

## Sessions

### 2026-11-19

- RT-3337 handed in by #3407; RT-3362 named by the assignment row is already closed, so the next task of the epic plan is RT-3338.
- The port of the task delivery loop into the task flow, asked by the owner, runs in its own session and branch.
