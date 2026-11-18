# Plan

**Task:** RT-3336 · **Branch:** RT-3336-ai-chat-chart-data, from `RT-3335-ai-chat-chart-block`; its PR goes into that branch (chain)
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-chart-data/`
**Behaviour:** changes

## Points

- **A:** the chart block draws the chart only; for exact numbers the assistant repeats the chart
  data as a markdown table in the text of the answer.
- **This task reaches:** under the chart a text button «Показать данные» opens a plain table of the
  same points — a row per category and a column per series, the number format of the chart; trees
  give one row per leaf with its path. «Скрыть данные» closes it; the state is not remembered.
- **Sign:** the showcase stories `DataTable` — `line`, `grouped_bar` with a negative and a zero,
  `treemap`, widths 328 and 728, the dark theme — approved by the owner; the new scenarios covered.
- **Milestone G of the epic:** the published kit draws the "month overview" answer as one `blocks`
  array; this task gives the chart its readable numbers.
- **Metric:** нет: a new control, not an improvement of a rule. A reader sees the table in the kit
  release after RT-3337; the sign for a person is the story `DataTable` on the published version.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/ui-kit-v2/ai-chat-chart/`, `docs/specs/ui-kit-v2/proposed/ai-chat-chart-data/`, `docs/specs/ui-kit-v2/scenarios.md` |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`, `docs/constitution/mockups.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/ai-chat-chart/lib/` (block, data rows, labels), its stories |

## What counts as done

- The table of every kind matches its points row by row: same order, same format, negatives and
  zeros shown, a missing point an empty cell.
- A wide table scrolls inside the block and never widens the feed; its height is not limited,
  the series and point limits of the spec bound it.
- The copy text of the answer does not change, and the open table does not enter it.
- The new scenarios from SC-UKV-1383 on have a test or a story named by their id.
- The owner approved the Figma mockup and the showcase, quotes in the archive.
- The agreement is merged into `docs/specs/ui-kit-v2/ai-chat-chart/`.

## Stages

### 1. Mockup

- **Steps:**
    1. Draw closed and open block, `line`, `grouped_bar`, `treemap`, widths 328 and 728, dark theme
    2. Measure the frames and ask the owner to approve mockup and plan
- **Readiness sign:** the owner's word is quoted in `approvals.md`.
- **Verified by:** `node tools/check-kit-approval.mjs` — no missing line for the mockup.

### 2. The rows

- **Steps:**
    1. Write a pure function that builds the table from `rtAiChatChartData(spec, locale)` —
       categories, series values, bins, cells, points and tree nodes as the chart gets them — and
       adds no order or labels of its own: cartesian a row per category and a column per series,
       heatmap the matrix of the chart, histogram the chart's bin bounds, trees a row per leaf of
       the chart's tree with its path
    2. Cover it by scenario id for each kind, a negative, a zero, a missing point, a
       histogram of three bins and a path that is the prefix of another
- **Readiness sign:** for every kind a test builds the chart data and the table from one spec and
  finds the same order, labels and formatted values; `rtAiChatChartText` is unchanged.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/ai-chat-chart` — green.

### 3. The control and the table

- **Steps:**
    1. Add the text button with chevron under the chart and the `<table>` with kit tokens, marked
       `native-ok` naming `rt-table`. Its markup and styles live in one file of the entry that
       RT-3337 takes for the `table` block: numeric columns right-aligned, negatives with a minus
    2. Add the labels «View data» and «Hide data» to `rt-kit-labels.en.ts` and the showcase
       Russian labels
    3. Cover open, close, not remembered, no button on pending, invalid and empty
- **Readiness sign:** the block tests pass and the button has `aria-expanded` and `aria-controls`.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/ai-chat-chart` — green.

### 4. Showcase

- **Steps:**
    1. Write the story `DataTable` with the open cases of the mockup, six series at 328 and a
       treemap of 200 leaves, and take its references
    2. Match the showcase with the mockup by numbers and ask the owner to approve it
- **Readiness sign:** the owner's word is quoted in `approvals.md`.
- **Verified by:** `node tools/check-kit-approval.mjs` — no missing line.

### 5. Closing

- **Steps:**
    1. Merge the agreement into the `ai-chat-chart` spec, bring the overview and README up to date
    2. Take the task folder apart and run the push gate
- **Readiness sign:** the proposed directory is gone and the push gate is green.
- **Verified by:** `npm run check:specs && test ! -d docs/specs/ui-kit-v2/proposed/ai-chat-chart-data` — no divergence, no directory.

## What this work does not do

- The switch in the full-screen dialog: by the owner's word «Только в блоке», the table lives in
  the block.
- The table block of the chat — RT-3337.
- Sorting, filtering or copying the table.
- The copy text of the answer stays as it is; the open table does not enter it.
- Making the assistant stop writing the data table in its text — the prompt of the consuming
  application.
