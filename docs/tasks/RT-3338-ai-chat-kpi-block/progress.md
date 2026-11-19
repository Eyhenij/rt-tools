# Progress

## Where we stand

- **State:** `разбор-закрыт`
- **Stage:** 0 of 0 — the plan is not written yet
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3338-ai-chat-kpi-block` from `RT-3337-ai-chat-table-block` (chain), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption.
- **Next step:** after the owner's word on the mockup — the product agreement `docs/specs/ui-kit-v2/proposed/ai-chat-kpi/`, then the plan.
- **Uncommitted:** the progress with the measurement and the mockup
- **Waiting for the owner:** the approval of the mockup node 8246-607
- **PR:** not open yet; the branch stands on RT-3337 (#3407), which stands on RT-3336 (#3402) and RT-3335 (#3398)

## Steps

The steps come with the plan.

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
