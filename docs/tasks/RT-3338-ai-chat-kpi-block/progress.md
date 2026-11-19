# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — The showcase and the match with the mockup
- **Done:** stage 3 — the `kpi` type, view, copy line and the `rt-ai-chat-kpi` component; the delta writer moved to `delta-number.ts` and serves the tile and the copy: `nx test --testFile=src/rich-editor/lib/components/ai-chat` 93 passed of 93 (logic 19), stat-tile 37, util 81, lint, stylelint, `check:tokens-styles`, `check:cascade-layer` and typecheck green. Stage 2 — the tile writes both delta rows by `RT_KIT_LOCALE`, has `size="compact"` and `deltaLabelVisible`: `nx test --testFile=src/lib/components/stat-tile` 37 passed of 37, lint, stylelint, `check:tokens-styles` and typecheck green; `node tools/visual-gate.mjs ui-kit-v2` — 1159 snapshots of 1159 matched, the tile references needed no retake. Stage 1 — `kpi-data.ts`, `kpi.schema.ts`, their specs: `nx test --testFile=src/lib/util/kpi` 13 passed of 13, the table util specs 22 of 22, typecheck green. Before it: the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3338-ai-chat-kpi-block` from `RT-3337-ai-chat-table-block` (chain), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption. The mockup is approved. The agreement holds SC-UKV-1436…1483, committed. The plan is written and reviewed by product-strategist and goal-critic; their findings are closed in the plan.
- **Next step:** review round one on the diff against `RT-3337-ai-chat-table-block`; the owner sees the showcase after round two (step 4.6).
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
- [x] 4.1 Write the stories of the block by the agreement's table «Screens and states» (328, 386, 728, deltas, growth is worse, short form, no delta, odd count, below 328, right to left, invalid, dark theme), plus 663/664, long texts, empty and several blocks; and a compact story of the tile.
- [x] 4.2 Write the chat stories with an answer of four cards (+, −, 0): the narrow panel, the full-screen mode of the default width and the full-screen mode with a 40rem reading column.
- [x] 4.3 Write the play steps that measure by `getBoundingClientRect` the columns, the card widths, one top per row, no text past its card and no feed widening: SC-UKV-1437–1439, 1460, 1461, 1464, 1472–1474, 1479.
- [x] 4.4 Write the `Overview.mdx` of the block and name the block in the chat Overview.
- [x] 4.5 Look at every story live, take the references, sweep all the stories.
- [>] 4.6 Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress, show the showcase to the owner and write their word into `approvals.md`.
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

- **The live check of the stories found the numbers reversed under `dir="rtl"`** — «₽ млн 1,24»,
  «% 12,5+», «.п.п 0», against SC-UKV-1474. The tile now puts the value and both delta numbers in
  `bdi dir="ltr"`; the story **Rtl** reads «1,24 млн ₽», «+12,5 %», «0 п.п.», and a tile spec holds
  it (38 of 38). Measured live in the pinned Chrome: Panel 375 wide — 2 columns of 184; FullScreen
  926 — 4 of 226; ReadingColumn 629 — 2 of 311; Rtl — the first card on the right (left 213 of
  386); Deltas — up rgb(5,150,105), down rgb(220,38,38), zero muted rgb(103,103,103), growth that
  is bad swaps the two; Short — «1,24 млн ₽», «2,5 млрд», «+3 п.п.»; Parts — four cards 94 high
  each; Invalid — three stubs and no block; Several — two blocks 114 high, one under the other;
  Themes — the dark card rgb(34,38,41), border rgb(51,56,61), text rgb(250,250,250); Playground at
  300 — one column. The tile story **Size**: at 136 the default size cuts the secondary line, the
  compact one wraps it (29 high). The dark danger colour reads at 3.2 : 1 — a kit-wide decision,
  written into the findings of the epic. Affected steps: 4.1, 4.4.

- **Stage 4 is verified:** `pnpm run test:stories:v2` — no empty showings among 1148 stories and
  121 overview pages (the first run counted two foreign overview pages empty while the showcase
  reloaded under the edits; both draw, the rerun is clean); 17 new references taken by
  `node tools/visual-gate.mjs ui-kit-v2 --update` on the KPI stories and the tile matrix, no old
  tile reference changed; `node tools/visual-gate.mjs ui-kit-v2` — 1176 snapshots of 1176, no
  orphaned references; `node tools/verify-ui-kit-v2-docs.cjs` — 116 pages, no divergence; lint,
  stylelint and typecheck green.

- **Review round one: qa-engineer 11 findings, product-strategist 7, goal-critic 4.** Each was
  checked against the code. Fixed:
    - a label of one 30-letter word went 122 px past its card: the compact tile now wraps the label;
    - a value below a million with a fraction broke inside the number. The owner's choice: «Округлять
      под карточку». The writer now drops the fraction from 100 000 and keeps three significant
      digits in the short form. The space before the unit is an ordinary one, so «-123 млрд ₽» wraps
      before «млрд ₽». New scenario SC-UKV-1484;
    - a percent delta rounded below the same number in points (1.45 → «+1,4 %» against «+1,5»);
    - the list lost its role in WebKit: `role="list"`;
    - a NaN or infinite delta drew «NaN%»: it is drawn as no delta;
    - the play steps measured boxes, not text: they measure the line boxes of every text node. `Odd`
      measures three cards at 328, `Rtl` holds SC-UKV-1474 with -1 240 000 ₽ and -4.2,
      `Panel` and `ReadingColumn` check one top per row, `Short` is measured at 328;
    - the tile story `Size` got the play step its spec comment named;
    - the copy line in `ru` got its test; `RT_KIT_LOCALE` names numbers and the tile delta;
    - six scenarios held by play steps carry a «Not covered» line naming the story.

  Written off:
    - the success and danger colours under AA. A kit token decision, already in the epic findings;
    - the remaining stories have no play steps. Their texts and colours are held by the component
      spec and the snapshots;
    - a 360 phone gives one column. The 315 came from a desktop scrollbar of 11 and the story's own
      border. On a touch screen the scrollbar overlays, and the block is 328;
    - Panel measured 375 in the pinned Chrome and 386 headless: the same scrollbar;
    - the CHANGELOG is built from commit subjects at release, and `3d8e5d19c` names the tile delta.
      The PR body names it too;
    - a share sent as 78 writes «7 800 %». The schema says a share is a fraction;
    - `Themes` holds 328 and 728, as the agreement table says; the plan sign named 386 too;
    - the styles spec reads CSS text. The play steps measure the drawn layout.

  The gate runs the stories through `test-storybook`, which runs the play steps and fails a test on a
  thrown error.

## Mockup / showcase

Measured in the pinned Chrome by `getComputedStyle` and `getBoundingClientRect` on the story
**Widths**, the first card at 328; the mockup is node 8246-607.

| what                       | mockup                          | showcase                      |
| -------------------------- | ------------------------------- | ----------------------------- |
| card at 328 / 386 / 728    | 160 / 189 / 176                 | 160 / 189 / 176               |
| columns at 328 / 386 / 728 | 2 / 2 / 4                       | 2 / 2 / 4                     |
| card frame                 | border 1, radius 12, padding 12 | 1 px rgb(224,224,224), 12, 12 |
| grid gap                   | 8                               | 8 / 8                         |
| gap inside the card        | 6                               | 6                             |
| label                      | 14 SemiBold                     | 14 / 600                      |
| value                      | 24/24 Bold                      | 24 / 24 / 700                 |
| delta                      | 14 Bold                         | 14 / 700, rgb(5,150,105) up   |
| base caption               | 12 Regular muted                | 12 / 400, rgb(103,103,103)    |
| period                     | 12 Regular muted                | 12 / 400, rgb(103,103,103)    |
| one top per row            | yes                             | yes — play step `expectRows`  |
| dark card                  | dark surface and border         | rgb(34,38,41), rgb(51,56,61)  |

## Sessions

### 2026-11-19

- RT-3337 handed in by #3407; RT-3362 named by the assignment row is already closed, so the next task of the epic plan is RT-3338.
- The port of the task delivery loop into the task flow, asked by the owner, runs in its own session and branch.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3338-ai-chat-kpi-block

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — The showcase and the match with the mockup
- **Next step:** step 4.1 — the stories of the block by the agreement's table «Screens and states».
- **PR:** not open yet; the branch stands on RT-3337 (#3407), which stands on RT-3336 (#3402) and RT-3335 (#3398)

The progress in full — `docs/tasks/RT-3338-ai-chat-kpi-block/progress.md`; the plan lies next to it.

### Uncommitted

```
?? projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/kpi/stories/
```

### Commits over the main branch

```
c869db7e3 feat(rt:ui-kit-v2): блок kpi в ответе rt-ai-chat
1737ba4d0 Merge remote-tracking branch 'origin/main' into RT-3338-ai-chat-kpi-block
3d8e5d19c feat(rt:ui-kit-v2): плитка пишет дельту по языку кита, компактный размер
bb4d79585 feat(rt:ui-kit-v2): данные, запись значения и схема блока KPI
1b7111481 docs(rt:ui-kit-v2): план RT-3338 одобрен — данные, плитка, блок, витрина
bef2c6fc0 docs(rt:ui-kit-v2): шаги RT-3338 в ходе задачи
554d10dfd docs(rt:ui-kit-v2): договорённость о блоке KPI закрывает разбор spec-critic
25faec7d0 docs(rt:ui-kit-v2): решения по разбору договорённости о блоке KPI
f304f1437 docs(rt:ui-kit-v2): договорённость о блоке KPI для RT-3338
488a9cf70 docs(rt:ui-kit-v2): макет блока KPI одобрен
6d6174fb4 docs(rt:ui-kit-v2): замер плитки и макет блока KPI для RT-3338
2bdcfda5c docs(rt:ui-kit-v2): разбор RT-3338 закрыт допущениями
ed28d05cf docs(rt:ui-kit-v2): задача RT-3338 взята, находки разбора RT-3337
079d87c7e docs(rt:ui-kit-v2): папка задачи RT-3337 разобрана
0e304def5 docs(rt:ui-kit-v2): план эпика отмечает RT-3337 отданной в PR
cdc3ae2fe docs(rt:ui-kit-v2): договорённость о блоке таблицы влита в спеку кита
c7f64abc3 fix(rt:ui-kit-v2): пункт меню в истории страницы чата берёт иконку box
f287c9706 feat(rt:ui-kit-v2): витрина блока таблицы и числа под rtl
5d65c7296 test(rt:ui-kit-v2): эталон панели разбора с таблицей нового вида
d8f919696 feat(rt:ui-kit-v2): таблицы markdown и данных графика в виде блока таблицы
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
