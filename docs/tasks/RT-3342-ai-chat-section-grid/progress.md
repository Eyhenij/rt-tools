# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 0 of 4 — the agreement and the plan before the code
- **Done:** the task is taken: assignee rt-tools-dev, the board column «In progress», the branch `RT-3342-ai-chat-section-grid` from `RT-3346-ai-chat-blocks`, the folder from the template. The epic plan puts RT-3342 before RT-3339 by the owner's word.
- **Next step:** the owner's word on the plan; then stage 1.
- **Uncommitted:** the plan — it is committed after the owner's word
- **Waiting for the owner:** the word on the plan, asked by menu
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

- **The section is a query container of its own, and the KPI block inside keeps its own.** The KPI
  host declares `container-type: inline-size` and asks an unnamed query, which reads the nearest
  container — the KPI host itself, not the section. So a KPI block in a cell answers by the cell
  width with no edit of the KPI styles. The section names its container, so that no query of a
  nested block ever reads it by mistake.
- **A `40rem` reading column gives the section exactly 640.** The feed pads by
  `max(16, (100% − 40rem) / 2)`, so its content box is 640 to the pixel, and `min-width: 640px`
  holds there; the story of the reading column measures it.

- **The agreement and the plan were reviewed by spec-critic, goal-critic and product-strategist
  before the plan went to the owner.** Taken, each checked against the code: the threshold is 600,
  not the 640 of the mockup frame — the feed scrolls, the kit scrollbar takes 12 from the layout
  (`_scrollbar.scss`), and the full-screen chat would get 628 or 634 and one column; the nested
  blocks stand in kit cells drawn by one template, so the section and the blocks component do not
  import each other; the default span follows the declared type; the schema is joined from the
  schemas of the nested types by a function, since the bare one names no field of a nested block;
  a section stands 16 from its neighbours; a group labelled by its heading, no role without a
  title; the owner looks at the showcase after the review rounds; the built package is read for
  the section; the epic plan names the release steps that close G. Written off: a state of a
  section in a streamed answer — the kit does not tell a block the answer is unfinished.
- **A failed play step does turn a run red.** `tools/visual-snapshots-v2.mjs` runs
  `test-storybook`, which runs the play steps; the plan still breaks one on purpose to see it.

## Sessions

### 2026-11-19

- RT-3339 paused after its plan was approved; RT-3342 taken.
