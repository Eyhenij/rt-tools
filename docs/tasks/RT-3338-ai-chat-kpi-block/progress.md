# Progress

## Where we stand

- **State:** `замысел-записан`
- **Stage:** 1 of 5 — The data of the block: item, value writer, schema (not begun: the plan waits for the roles and the owner's word)
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3338-ai-chat-kpi-block` from `RT-3337-ai-chat-table-block` (chain), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption.
- **Next step:** the plan is written (uncommitted until the owner's word); product-strategist and goal-critic review it, their findings are closed, then the plan goes to the owner for approval. The agreement holds SC-UKV-1436…1483, committed.
- **Uncommitted:** no
- **Waiting for the owner:** no; the mockup is approved: «Одобряю макет»
- **PR:** not open yet; the branch stands on RT-3337 (#3407), which stands on RT-3336 (#3402) and RT-3335 (#3398)

## Steps

- [>] 1.1 Write the lenient data function of a KPI item and block next to `table-data.ts`: missing value and label, format, currency, delta, deltaUnit, base, period, growthIsGood.
- [ ] 1.2 Write the value writer on top of `rtTableCellWriter`: the short form from a million with 0–2 fraction digits and trailing zeros dropped, rounding to a million written short.
- [ ] 1.3 Write the JSON schema of the block next to `table.schema.ts` and export both from the util barrel.
- [ ] 1.4 Write the specs of the data function, the writer and the schema with the scenario numbers of the agreement.
- [ ] 2.1 Write both delta rows of `rt-stat-tile` by `Intl.NumberFormat` for the kit label locale: a plus on growth, at most one fraction digit, direction by the written number, `en` for a refused locale.
- [ ] 2.2 Add the compact size: value 24/24, delta 14, delta on its own line, inner gaps 6, wrapping secondary and base caption.
- [ ] 2.3 Add the option that shows the primary delta label as visible text without a duplicate `title`.
- [ ] 2.4 Name the locale in the existing tile specs and add the specs of the new scenarios.
- [ ] 3.1 Add the `KpiBlock` type, the `kpi` view, `kpi` in `OWN_TYPES` and the data step in `toBlockViews`.
- [ ] 3.2 Write the `rt-ai-chat-kpi` component: a list of framed compact tiles, the grid by a block-local container query (one column below 328, two from 328, four from 664), tokens only.
- [ ] 3.3 Add the `kpi` case to the blocks template and the copy line to `blockText`.
- [ ] 3.4 Write the specs of the block component, the logic and the copy.
- [ ] 4.1 Write the stories of the block: 328, 386, 728, below 328, right to left, empty, invalid, several blocks, presets, themes; and a compact story of the tile.
- [ ] 4.2 Write the `Overview.mdx` of the block and name the block in the chat Overview.
- [ ] 4.3 Look at every story live, take the references, sweep all the stories.
- [ ] 4.4 Match the stories with the approved mockup by numbers and show the showcase to the owner.
- [ ] 5.1 Merge the agreement into `docs/specs/ui-kit-v2/ai-chat-kpi/` with its bindings; edit the stat-tile and chat specs and the kit spec indexes as the agreement names.
- [ ] 5.2 Bring `CONTEXT.md` of ai-chat and stat-tile up to the block and the tile edits.
- [ ] 5.3 Run the roles goal-critic and product-strategist on the result.
- [ ] 5.4 Mark row 6 of the epic plan, write the archive record, take the task folder apart.
- [ ] 5.5 Run the push set, push, open the PR into `RT-3337-ai-chat-table-block`.

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

- **The mockup is drawn:** https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8246-607 —
  four cards at 328 and 386 (two columns) and 728 (four columns) in the light theme, 328 and 728 in
  the dark. A card is framed by the block (border 1, radius 12, padding 12, gap 6; the tile draws no
  frame); label 14 SemiBold, value 24/24 Bold, delta 14 Bold with the arrow and the visible base
  caption 12 Regular muted, period 12 Regular muted; grid gap 8. A value of a million and more is
  written short («1,24 млн ₽»), below that in full («8 400 ₽»). Measured: cards 160 at 328, 189 at
  386, 176 at 728; one top per row; no text past its card; the frame overlaps no other frame on the
  sheet. Waiting for the owner's word on it.

## Sessions

### 2026-11-19

- RT-3337 handed in by #3407; RT-3362 named by the assignment row is already closed, so the next task of the epic plan is RT-3338.
