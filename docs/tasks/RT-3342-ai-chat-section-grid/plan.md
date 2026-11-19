# Plan

**Task:** RT-3342 · **Branch:** RT-3342-ai-chat-section-grid
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-section/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** a composed answer of the chat — a summary, KPI cards, charts, a table — stands in the feed
  as one column at any width; in the full-screen mode two charts do not stand side by side. The
  published kit, 0.49.0, has no blocks at all: they wait in the epic branch.
- **This task reaches:** a developer of an application on the kit sees in the kit showcase that one
  `blocks` array with one `section` block draws the answer «обзор месяца» — a title, a summary, 4
  KPI, 2 charts, a table — as a grid in the full-screen chat and as a column in the narrow panel,
  with no template of the application.
- **Sign:** the play steps of the chat stories with the overview answer in the narrow panel and in
  the full-screen mode: one column in the first, the two charts side by side in the second. The
  owner looks at both stories in the showcase.
- **Milestone G of the epic:** a published kit draws the answer «обзор месяца» as one `blocks`
  array without a template of the application. This task gives the block and the story; G itself
  is closed by the release steps the epic plan names after this task: the main branch into the
  epic branch, the PR of the epic into the main one, the release, and the built package read for
  the section.
- **Metric:** нет: new kit block, not a rule edit.

## Task footprint

| What  | Where                                                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-section/`, `docs/specs/ui-kit-v2/ai-chat/`, `docs/specs/ui-kit-v2/ai-chat-kpi/`                                    |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`, `docs/constitution/mockups.md`    |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                                               |
| Code  | `projects/ui-kit-v2/src/lib/util/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`, `projects/ui-kit-v2/src/ai-chat-chart/` (stories only) |
| Plans | `docs/plans/ai-chat-blocks.md` — the release steps that close G                                                                                          |

## What counts as done

- An answer whose `blocks` is one `section` block draws the overview: one column at 328 and 386,
  two columns from 600, the charts side by side on one top, the summary, the KPI block and the
  table at the whole width. The stories use no `rtAiChatMessageExtra`. Each of these is measured by
  a play step, and a play step that fails turns `pnpm run test:visual:v2` red: it runs the stories
  by `test-storybook`.
- A full-screen chat with the thread column and one with a `40rem` reading column, both scrolling,
  still draw two columns.
- The span of a nested block follows its declared type and is overridden by `span`; the order of
  the list is kept; a section inside a section and a section without a block are the plate.
- The answer copy gives the title and the texts of the nested blocks; the kit exports the section
  schema and the function that joins the schemas of the nested types.
- The showcase holds every state of the agreement's table «Screens and states»; it matches the
  approved mockup by numbers and is approved by the owner after the review rounds.
- The built package holds the section: `dist/ui-kit-v2` names the component and the schema.
- The agreement is merged into `docs/specs/ui-kit-v2/ai-chat-section/`, the chat and KPI specs are
  edited as the agreement names, the epic plan names the release steps, and the PR is open into
  `RT-3346-ai-chat-blocks`.

## Stages

### 1. The data of the section: nested views, span, copy, schema

- **Steps:**
    1. Add the `SectionBlock` type, the nested block type with `span`, the `section` view with its cells, `section` in `OWN_TYPES` and the section data step in `toBlockViews`: the dropped items, the default span by the declared type, the `span` override, the plate for a nested section and for a section without a block.
    2. Add the copy of a section to `blockText`: the trimmed title and the texts of the nested blocks, nothing for a nested section, nothing when no block gives a text.
    3. Write the JSON schema of the section and the function that joins the schemas of the nested types in `section.schema.ts` next to `kpi.schema.ts`, and export both from the util barrel.
    4. Write the specs of the logic, the copy and the schema with the scenario numbers of the agreement: SC-UKV-1507, 1511, 1512, 1515, 1516, 1518, 1519, 1524.
- **Readiness sign:** the logic and schema specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/rich-editor/lib/components/ai-chat/blocks --output-style=static --skip-nx-cache` — the line «Tests:» with every test passed and none failed; `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/util/section --output-style=static --skip-nx-cache` — the same.

### 2. The section in the feed: the title, the cells and the grid

- **Steps:**
    1. Move the cases of the feed into one `ng-template` of the blocks template, drawn for the feed as before.
    2. Write the `rt-ai-chat-section` component: a group labelled by its heading through a unique id, the heading role of the level 3, the cells that carry the span and take the cell template, the grid by a named container query — one column below 600, two from 600, the gap `--rt-space-md`, tokens only.
    3. Add the `section` case to the blocks template and the gap of 16 around a section in the feed.
    4. Write the specs of the section component, of the blocks component and the styles spec (the named container, the threshold 600, the gap, the span of a cell): SC-UKV-1510, 1514, 1517, 1523, 1525.
- **Readiness sign:** the ai-chat specs run and pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/rich-editor/lib/components/ai-chat --output-style=static --skip-nx-cache` — the line «Tests:» with every test passed and none failed.

### 3. The showcase

- **Steps:**
    1. Write the overview fixture — one `blocks` array with one `section`: a title, a summary, 4 KPI, 2 charts, a table — and the stories of the section by the agreement's table «Screens and states»: 328, 386, 640, 926, 599 and 600, a lone column block, a span set, no title, a long title, a nested section, an unknown block, a KPI block in a narrow cell, two sections, right to left, invalid, dark at 386 and 926.
    2. Write the chat stories with the overview answer taller than the feed: the narrow panel, the full-screen mode without the thread column, with it, and with a `40rem` reading column.
    3. Write the play steps that measure by `getBoundingClientRect` the columns, the cell widths, one top per row, the gaps, no kit block past its cell and no feed widening: SC-UKV-1508, 1509, 1513, 1520–1522, 1526–1528.
    4. Break one measurement on purpose, run `pnpm run test:visual:v2`, see it red on that story, and restore the measurement.
    5. Write the `Overview.mdx` of the block with the whole `blocks` array and the note that charts in a section need `provideRtAiChatChart()`; name the block and the joining function in the chat Overview and the README.
    6. Look at every story live, take the references, sweep all the stories.
    7. Match the stories with the approved mockup by numbers into the table «mockup / showcase» in the progress.
- **Readiness sign:** the play steps pass, and a broken one was seen red; the snapshots match their
  references; the sweep finds no empty showing; the table counts every number of the mockup.
- **Verified by:** `pnpm run test:visual:v2` — every section frame matched, none failed; `pnpm run test:stories:v2` — «There are no empty showings and no drawing errors»; `node tools/kit-match.mjs numbers` on the two number files of the mockup and the showcase — its match line.

### 4. Review rounds, the owner's look and closing

- **Steps:**
    1. Review round one by qa-engineer, product-strategist and goal-critic; fix the confirmed findings in one commit.
    2. Review round two by fresh readers; fix the confirmed findings in one commit; run the showcase checks of stage 3 again on the code that ships.
    3. Show the showcase to the owner — the two chat stories of the sign first — and write their word into `approvals.md`.
    4. Build the kit and read `dist/ui-kit-v2` for the section component and the schema export.
    5. Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-section/` with its bindings; edit the chat and KPI specs and the kit spec indexes as the agreement names.
    6. Bring `CONTEXT.md` of ai-chat and the comment of the block providers up to the section.
    7. Mark the row of RT-3342 in the epic plan and write there the release steps that close G; write the archive record, take the task folder apart.
    8. Run the push set, push, open the PR into `RT-3346-ai-chat-blocks`.
- **Readiness sign:** the owner's word stands in `approvals.md`; the built package names the section;
  the spec audit has no refusal; the push set is green; the PR is open.
- **Verified by:** `pnpm run build:ui-kit-v2` — exit 0, and a search of `dist/ui-kit-v2` finds `rt-ai-chat-section` and the schema constant; `node tools/check-specs.mjs` — exit 0 with no line about `ai-chat-section`.

## What this work does not do

- A section inside a section, a collapsible section, more than two columns, a state of a section in
  an answer still being written.
- The link card — RT-3339, its plan is approved and waits; the sources block — RT-3340.
- The PR of the epic branch into the main one and the release: steps of the epic plan, taken right
  after this task by the owner's word.
- A model call that checks how a model writes an overview by the joined schema: it stays a
  hypothesis of the epic findings, checked by the first application that wires a model.
