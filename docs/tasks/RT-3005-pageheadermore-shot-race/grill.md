# Grill

## The owner request

> Do this task here: “Кадр PageHeaderMore ' More плавает в наборе снимков”

The card the owner pressed was proposed by this session after RT-3000. The sibling session on
RT-3001 met the same red frame twice after merging main and was told not to re-take the reference.

## What the tree already has

- The second kit's snapshot harness: `projects/ui-kit-v2/.storybook/test-runner.ts`, the waits in
  `snapshot-wait.ts`, the evidence of a failed frame in `.rt-snapshot-evidence/`.
- The story: `page-header-more.stories.ts`, its `More` opens the panel in `play` through
  `openStoryOverlay` from `story-overlay.ts`.
- Two kept evidences of the failed frame (05:13 and 05:41, 30 October): window 1280×720, page
  1280×720. The window was not widened, and the `--w1380` frame was never reached. Both diverge by
  the same 28 298 points: the panel stands 31 points left of the reference, the header row stands
  where it stands in the reference.

## What the rules already say

- `ui-component-tests`: a settled frame is waited for by an event, not by a countdown; a wait waits
  for what is awaited, not for its consequence.
- `ui-component-tests-visual`: a reference orphaned by a fallen first frame is a consequence, not a
  rename — the `--w1380` reference reported without a story goes away with the divergence.

## Questions and answers

No questions: the cause and the cure are inside the showcase, and the look of the kit does not
change.

## Decisions

- **The cause is the moment of the gesture, not the window change.** The guess of RT-3000 — the
  overlay lags a window resize — did not hold: the failed frame had no resize at all. The panel is
  aligned by the end of the «Ещё» button, and CDK places it once and follows the anchor only on
  scroll and resize. Opened before the kit font arrived, the row stood narrower, and the panel
  stayed where the narrower row put it. Rejected: re-taking the reference — it pins one of two
  random frames.
- **The gesture waits for the fonts in the showcase helper, not in the harness.** The harness
  waits for fonts too, but after `play`, when the panel is already placed. Rejected: making the
  harness reposition every connected overlay — it hides the order of events instead of fixing it.

## What is left unclear

- Nothing blocks the work.
