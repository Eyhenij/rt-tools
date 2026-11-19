# Progress

## Where we stand

- **State:** `разбор-закрыт`
- **Stage:** 0 of — — the mockup before the agreement
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3339-ai-chat-link-block` from `RT-3338-ai-chat-kpi-block` (chain, PR #3429), the folder from the template. The exploration is written into the grill; the six questions and the design decisions are closed by assumption.
- **Next step:** the owner's word on the mockup 8339-452; after it the product agreement in `docs/specs/ui-kit-v2/proposed/ai-chat-link/` and the plan.
- **Uncommitted:** no
- **Waiting for the owner:** the word on the mockup 8339-452
- **PR:** not open yet; the base is `RT-3338-ai-chat-kpi-block` (#3429)

## Steps

The plan is not written yet.

## Decisions along the way

- **The mockup 8339-452 is drawn from the kit's own parts, measured in the pinned Chrome.** The
  button `sm`: height 32, padding 14, font 13/500, radius 10, gap 8; disabled — text #959595,
  outlined border #e0e0e0. The tag `sm`: height 16, padding 4, font 12/12, gap 2, a capsule;
  success #059669 on #ecfdf5, danger #dc2626 on #fef2f2, neutral #282828 on #e0e0e0; in the dark
  theme the status at 12% of its colour, neutral #fafafa on #17181c. The card takes the KPI frame:
  border 1 by `border/default`, radius 12, padding 12, gap 12. The row: an icon box 36 with radius
  8, the title 14/600 on 17, the section 12/16 muted, the status tag under them; the reason of
  `failed` is a line 12/16 in the error text colour (#c00111, #dc2626 in the dark theme). Drawn at
  328 and 386 (the side panel) and 640 (the full-screen reading column), the dark theme at 328.
- **The status tag stands under the section, not at the right of the title.** At the right it
  wrapped the title to two lines at 328.
- **Measured by node bounds:** every card keeps its two buttons on one top; no frame overlaps
  another or a neighbour on the page; cards are 127 high, 155 with a reason.

## Sessions

### 2026-11-19

- RT-3338 handed in by #3429; the next task of the epic plan is RT-3339.
