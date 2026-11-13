# Grill

## The owner request

> делай правки этого говна сейчас

> переключайся на эпик по проверкам

> бери RT-3269

Said on 13.11.2026 after two analyses of why the set before a push fell that day.

## What the tree already has

- The wrapper of the second kit, `tools/visual-snapshots-v2.mjs`, matches the references directory
  against the registry of opened stories before it reads the exit code of the run.
- The harness of the second kit writes a story into the registry after its frame is taken. A story
  that failed before the frame is absent from the registry.
- The harness of the first kit writes the story before the render, in `preVisit`.
- The set before a push prints the last 25 lines of a red step, so the failure of the story itself
  is cut off.
- Scenarios of the pure parts live in `tools/tests/visual-gate.test.sh` and
  `tools/tests/showcase-probe.test.sh`.

## What the rules already say

- Rule `testing`: red has an assigned action — first the output of the step, then the decision. A
  step that hides the output of the failure makes that action impossible.
- Rule `testing`: a retry inside the snapshot step is not added; the wrapper says so itself.

## Questions and answers

**Take epic RT-3269 with this task first?**
«бери RT-3269»

## Decisions

- **The story is written into the registry before the frame, with every width frame it declares** —
  the first kit already does so. Rejected: writing it after the frame and guessing the failed ones
  from the output of the run.
- **On a red run the wrapper names the unopened stories as not reached, not as orphaned
  references** — a story may fail before the visit begins, and the registry does not see that.
  Rejected: silence about them on a red run — then an orphan is learned of last of all.

## What is left unclear

- Why the tree stories did not open in the run of 13.11.2026: the log of that run is cut. It does
  not block the work: the fix makes the next such run name the cause.
