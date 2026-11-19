# Progress

## Where we stand

- **State:** `разбор-закрыт`
- **Stage:** 0 of — — the exploration and the mockup before the agreement
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3342-ai-chat-section-grid` from `RT-3346-ai-chat-blocks`, the folder from the template. The epic plan puts RT-3342 before RT-3339 by the owner's word.
- **Next step:** the owner's word on the mockup 8375-625; after it the product agreement in the kit's proposed specs and the plan.
- **Uncommitted:** no
- **Waiting for the owner:** the word on the mockup, asked by menu
- **PR:** not open yet; the base is `RT-3346-ai-chat-blocks`

## Steps

The plan is not written yet.

## Decisions along the way

- **RT-3342 goes before RT-3339.** The owner's word of 19.11.2026: «сначала сделай RT-3342, потом
  вливаем» — the epic branch goes into the main one after this task, so that the first release
  closes milestone G whole. The plan of RT-3339 is approved and waits in its branch.
- **The branch stands on the epic branch, not on the branch of RT-3339.** That branch carries its
  own task folder and no code; a PR of this task from it would carry both.

- **The mockup 8375-625 is built from the approved block mockups.** The KPI cards, the two charts
  and the table are clones of the frames approved in RT-3338, RT-3335, RT-3336 and RT-3337; the
  section adds only its title and the grid. Drawn at 328, 386, 640 and 926 in the light theme and
  at 386 and 926 in the dark one. The title is 16/20 SemiBold in `text/primary`, 12 above the grid;
  the grid gap is 16 both ways.
- **Measured by node bounds:** six sections, no overlaps, nothing past the section width. At 328
  and 386 every block is one column wide. At 640 the charts are 312 each, side by side on one top
  (y 340), the KPI block holds two columns (it is under 664). At 926 the charts are 455 each on one
  top (y 198), the KPI block four columns. The summary, the KPI block and the table take the whole
  row at every width.
- **The grid gap is 16, not the 8 of the feed.** Two charts 8 apart read as one; the owner sees it
  on the mockup.

## Sessions

### 2026-11-19

- RT-3339 paused after its plan was approved; RT-3342 taken.
