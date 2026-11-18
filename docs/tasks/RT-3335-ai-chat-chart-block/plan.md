# Plan

**Task:** RT-3335 · **Branch:** RT-3335-ai-chat-chart-block
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-chart/`
**Behaviour:** changes

## Points

- **A:** a `chart` block in an answer of `rt-ai-chat` shows the dashed plate «not supported»; the
  application parses the chart spec of a tool call and draws the chart with its own template.
- **This task reaches:** the application registers one provider of the entry `ai-chat-chart`, and
  a `chart` block with a spec string is drawn in the answer: ten kinds, the notice on an invalid
  spec, the placeholder while pending, full screen, PNG, copy as text.
- **Sign:** the showcase stories of the block — one per kind, pending, invalid, empty, both themes —
  approved by the owner; SC-UKV-1341…1377 covered by tests.
- **Milestone G of the epic:** the published kit draws the "month overview" answer as one `blocks`
  array; this task gives its two charts.
- **Metric:** нет: a new block, not an improvement of a rule.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`, `docs/specs/ui-kit-v2/proposed/ai-chat-chart/`, `docs/specs/ui-kit-v2/scenarios.md` |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`, `docs/constitution/mockups.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/component-structure/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/`, `.claude/skills/lib-layers/` |
| Code  | `projects/ui-kit-v2/ai-chat-chart/` (new entry), `projects/ui-kit-v2/src/ai-chat-chart/` (new), `projects/ui-kit-v2/src/lib/i18n/` (labels) |

## What counts as done

- The entry `@rt-tools/ui-kit-v2/ai-chat-chart` builds, and neither `rich-editor` nor `chart`
  imports it or each other.
- Every scenario SC-UKV-1341…1377 has a test or a story named by its id.
- The owner approved the Figma mockup of the block and its showcase, quotes in the archive.
- The agreement is merged into `docs/specs/ui-kit-v2/ai-chat/`, and the scenario index lists the
  chart and the chat ranges.

## Stages

### 1. Mockup

- **Steps:**
    1. Draw the block in the kit Figma file: title row, the ten kinds, pending, invalid, empty, full
       screen, light and dark
    2. Measure the frames and ask the owner to approve the mockup through the parent session
- **Readiness sign:** the owner's word of approval is quoted in `approvals.md` of the task folder.
- **Verified by:** `node tools/check-kit-approval.mjs` — no missing line for the mockup.

### 2. The spec, the schema and the check

- **Steps:**
    1. Create the entry `ai-chat-chart` and its barrel
    2. Write the spec types, the exported JSON schema and the hand-written check
    3. Write the mapping of the ten kinds onto `IRtChart` with the formats
    4. Add `ajv` 8.20.0, already in the lockfile, as an exact dev dependency for the schema test
    5. Cover the check, the schema and the mapping with unit tests by scenario id
- **Readiness sign:** the tests of the entry pass, the sample specs pass both the schema under Ajv
  2020 and the check, and the entry builds.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/ai-chat-chart && pnpm run build:ui-kit-v2` — all suites green, the build ends with no error.

### 3. The block

- **Steps:**
    1. Write the block component: title row, subtitle, axis names, notice, placeholder, empty state
    2. Add full screen through the kit dialog and the PNG download
    3. Add the provider with the `toText` factory and the kit labels in eight languages
    4. Cover the block with component tests by scenario id
- **Readiness sign:** the block tests pass, `build:ui-kit-v2` builds the new entry, and neither the
  editor nor the chart bundle imports d3 or the new entry across the boundary.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/ai-chat-chart && pnpm run build:ui-kit-v2 && ! grep -lE "d3-|ai-chat-chart" dist/ui-kit-v2/fesm2022/rt-tools-ui-kit-v2-rich-editor.mjs && ! grep -l "rich-editor" dist/ui-kit-v2/fesm2022/rt-tools-ui-kit-v2-chart.mjs` — tests green, the build passes, both greps print nothing.

### 4. Showcase

- **Steps:**
    1. Write the stories: one per kind, pending, invalid, empty, both themes, narrow feed, and an
       `rt-ai-chat` answer of a markdown block and a chart block
    2. Take the snapshot references and match the showcase with the mockup
    3. Ask the owner to approve the showcase through the parent session
- **Readiness sign:** the owner's word of approval is quoted in `approvals.md`.
- **Verified by:** `node tools/check-kit-approval.mjs` — no missing line.

### 5. Closing

- **Steps:**
    1. Merge the agreement into the ai-chat subdomain spec and fix the scenario index
    2. Bring the README and the CONTEXT of the chat up to date
    3. Run the push gate
- **Readiness sign:** the proposed directory is gone, the ai-chat spec holds SC-UKV-1341…1377,
  every one of them is named by a test or a story, and the push gate is green.
- **Verified by:** `npm run check:specs && test ! -d docs/specs/ui-kit-v2/proposed/ai-chat-chart && grep -c "SC-UKV-13[4-7][0-9]" docs/specs/ui-kit-v2/ai-chat/scenarios.md` — no divergence, no directory, the count is 37.

## What this work does not do

- The mark of the end of a tool call in the chat protocol — a finding of the epic.
- The answer to a chart tool call — a finding of the epic.
- The data table under «View data» — RT-3336; the table block — RT-3337.
- New drawing in `rt-chart`.
- The answer of text, chart and table in one `blocks` array: its table part comes with RT-3337,
  and this task shows text and chart together.
