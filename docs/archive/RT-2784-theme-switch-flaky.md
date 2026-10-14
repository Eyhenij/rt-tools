# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: the push gate on 12 October 2026 failed once in three full runs of the admin end-to-end suite on scenario SC-MB-147, and passed in the other two. The branch broke nothing.

## What the tree already had

- The scenario opens a section, switches the theme in the profile popup, checks the dark attribute, reloads, checks it again and takes the frame `shell-dark`.
- The theme service writes the attribute and the stored choice in one effect, one after the other, so a reload right after the attribute flips does not lose the choice.
- The failing line of 12 October kept only its duration (3.0 s against 2.5 s of a passing run); the failure text and the frame diff were not kept.

## What was run

- The scenario alone: 10 runs, then 15 runs under full CPU load, no failure.
- The whole suite: 3 runs, then 1 run under full CPU load, 141 tests each, no failure.

## Decisions

- **The task is closed without a change to the scenario or the code.** The owner chose it. The cause is not proven, and an edit made by guess could be wrong and hide the next failure. Rejected: adding a wait for the stored theme before the reload — it fixes a race nobody has seen; keeping the task open until the failure comes again.
- **The failure, if it comes again, is read from the Playwright artifacts of that run.** The suite keeps the trace and the screenshot of a failed test; the push gate does not copy them out, so a failure seen there needs a rerun of the suite by hand while the artifacts still lie in the suite directory.
