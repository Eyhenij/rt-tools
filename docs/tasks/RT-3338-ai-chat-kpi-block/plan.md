# Plan

**Task:** RT-3338 · **Branch:** RT-3338-ai-chat-kpi-block
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-kpi/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the chat answer has no KPI cards; a model that wants a row of key numbers writes them as
  text or as a table, and `rt-stat-tile` writes its delta with a hand-made comma in every locale.
- **This task reaches:** a developer of an application on the kit sees in the kit showcase that a
  `kpi` block of the answer draws a row of KPI cards — value, change to a base with its caption,
  period — two to a row in the narrow panel and four in the full-screen one, coloured by whether
  the change is good, and copies a card per line. The person reading an answer gets it with the
  release at the end of the epic (milestone G).
- **Sign:** the showcase stories of the `kpi` block at 328, 386 and 728 in both themes and the chat
  stories in the narrow panel and in the full-screen mode, their play steps measuring columns and
  card widths, their references taken; the table «mockup / showcase» in the progress with every
  number of the approved mockup; the owner's word on the showcase in `approvals.md`; the specs of
  the block and the tile green.
- **Milestone G of the epic:** a published kit draws the answer «обзор месяца» (total, 4 KPI, 2
  charts, table) as one `blocks` array; this task gives its 4 KPI.
- **Metric:** нет: new kit block, not a rule edit.

## Task footprint

| What  | Where                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-kpi/`, `docs/specs/ui-kit-v2/stat-tile/`, `docs/specs/ui-kit-v2/ai-chat/`      |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/mockups.md`      |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`           |
| Code  | `projects/ui-kit-v2/src/lib/util/`, `projects/ui-kit-v2/src/lib/components/stat-tile/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/` |

## What counts as done

- An answer with a `kpi` block of 4 items draws 4 cards: two columns at 328 and 386, four at 728
  and in the full-screen chat of the default width, two in the full-screen chat with a 40rem
  reading column (SC-UKV-1472), one below 328; positive, negative and zero deltas coloured by the
  item flag. Each of these is measured by a play step, not looked at.
- The tile has a compact size, writes both delta rows by the kit locale and shows the base caption
  when asked; its existing scenarios hold, rewritten for the locale where the agreement says so;
  the tile story references whose delta text changed are taken anew.
- The answer copy gives one tab-separated line per card; the kit exports the block schema.
- The showcase holds every state of the agreement's table «Screens and states», right to left,
  empty and invalid; it matches the approved mockup by numbers and is approved by the owner.
- The agreement is merged into `docs/specs/ui-kit-v2/ai-chat-kpi/`, the stat-tile and chat specs are
  edited as the agreement names, and the PR is open into `RT-3337-ai-chat-table-block`.

## Stages

### 1. The data of the block: item, value writer, schema

- **Steps:**
    1. Write the lenient data function of a KPI item and block in `kpi-data.ts` next to `table-data.ts`: missing value and label, format, currency, delta, deltaUnit, base, period, growthIsGood.
    2. Write the value writer in `kpi-data.ts` on top of `rtTableCellWriter`: the short form from a million with 0–2 fraction digits and trailing zeros dropped, rounding to a million written short.
    3. Write the JSON schema of the block in `kpi.schema.ts` next to `table.schema.ts` and export both from the util barrel.
    4. Write the specs of the data function, the writer and the schema with the scenario numbers of the agreement: SC-UKV-1440–1447, 1459, 1476, 1482, 1483.
- **Readiness sign:** the KPI util specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/util/kpi` — «Tests:» with every test passed and none failed.

### 2. The tile: compact size, delta by the locale, visible base caption

- **Steps:**
    1. Write both delta rows of `rt-stat-tile` by `Intl.NumberFormat` for the kit label locale: a plus on growth, at most one fraction digit, direction by the written number, `en` for a refused locale.
    2. Add the compact size: value 24/24, delta 14, delta on its own line, inner gaps 6, wrapping secondary and base caption.
    3. Add the option that shows the primary delta label as visible text without a duplicate `title`.
    4. Name the locale in the existing tile specs and add the specs of the new scenarios: SC-UKV-1453–1456, 1466–1471.
    5. Run the tile story snapshots and take anew the references whose delta text changed.
- **Readiness sign:** the tile specs run and pass, the existing ones with their locale named; the
  tile snapshots match their references.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/stat-tile` — «Tests:» with every test passed and none failed.

### 3. The block in the chat answer

- **Steps:**
    1. Add the `KpiBlock` type, the `kpi` view, `kpi` in `OWN_TYPES` and the data step in `toBlockViews`.
    2. Write the `rt-ai-chat-kpi` component: a list of framed compact tiles, the grid by a block-local container query (one column below 328, two from 328, four from 664), tokens only.
    3. Add the `kpi` case to the blocks template and the copy line to `blockText`.
    4. Write the specs of the block component, the logic, the copy and the styles spec `rt-ai-chat-kpi.styles.spec.ts` (thresholds 328 and 664, the gap, the frame tokens): SC-UKV-1436, 1448–1452, 1457, 1458, 1462, 1463, 1475, 1477, 1478, 1480, 1481.
- **Readiness sign:** the ai-chat specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/rich-editor/lib/components/ai-chat` — «Tests:» with every test passed and none failed.

### 4. The showcase and the match with the mockup

- **Steps:**
    1. Write the stories of the block by the agreement's table «Screens and states» (328, 386, 728, deltas, growth is worse, short form, no delta, odd count, below 328, right to left, invalid, dark theme), plus 663/664, long texts, empty and several blocks; and a compact story of the tile.
    2. Write the chat stories with an answer of four cards (+, −, 0): the narrow panel, the full-screen mode of the default width and the full-screen mode with a 40rem reading column.
    3. Write the play steps that measure by `getBoundingClientRect` the columns, the card widths, one top per row, no text past its card and no feed widening: SC-UKV-1437–1439, 1460, 1461, 1464, 1472–1474, 1479.
    4. Write the `Overview.mdx` of the block and name the block in the chat Overview.
    5. Look at every story live, take the references, sweep all the stories.
    6. Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress, show the showcase to the owner and write their word into `approvals.md`.
- **Readiness sign:** the play steps pass; the snapshots match their references; the sweep finds no
  empty showing; the table counts every number of the mockup; the owner's word stands in
  `approvals.md` (SC-UKV-1465).
- **Verified by:** `pnpm run test:visual:v2` — every KPI frame matched, none failed; `pnpm run test:stories:v2` — «There are no empty showings and no drawing errors».

### 5. Closing

- **Steps:**
    1. Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-kpi/` with its bindings; edit the stat-tile and chat specs and the kit spec indexes as the agreement names.
    2. Bring `CONTEXT.md` of ai-chat and stat-tile up to the block and the tile edits.
    3. Run the roles goal-critic and product-strategist on the result.
    4. Mark row 6 of the epic plan, write the archive record, take the task folder apart.
    5. Run the push set, push, open the PR into `RT-3337-ai-chat-table-block`; its body says it merges only after #3407, so the block and the tile edit do not ride the first release.
- **Readiness sign:** the spec audit has no refusal; the push set is green; the PR is open.
- **Verified by:** `node tools/check-specs.mjs` — exit 0 with no line about `ai-chat-kpi` or `stat-tile`.

## What this work does not do

- A sparkline, a click on a card, a screen-reader text for good and bad — a tile edit of its own.
- The section and the grid of a composed answer — RT-3342; the sources block — RT-3340.
- Passing the chat's full-screen mode into blocks: the block lays out by its own width, so a
  full-screen chat with a reading column narrower than 664 keeps two columns (SC-UKV-1472).
- The first release of the epic: this block goes into the second one.
