# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the two findings of the package
- **Done:** stage 1 — the four findings of this tree are in the rules
- **Next step:** `turn-conduct` and the refusal tail of the turn exit guard
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 `ui-component-tests`: a `play` step asserts a size against a lower bound, not presence.
- [x] 1.2 `rt-tools-storybook`: `Playground` is a showing of one instance.
- [x] 1.3 `rt-tools-storybook`: a state class misses a node drawn after the resize.
- [x] 1.4 The override of `testing`: image suites do not run from a working tree under the temporary directory.
- [>] 2.1 `turn-conduct` and the refusal tail of the turn exit guard: where the owner's stop word is written.
- [ ] 2.2 `task-flow`: a stop on a later step is written at once.
- [ ] 2.3 Build and lay out the package.
- [ ] 3.1 Record the owner's word and where each finding went.

## Decisions along the way

- **The assignment row of this copy names RT-2471.** Epic RT-2353 is merged and closed; the owner named this work outside an epic. Affected stage of the plan: none.

- **The finding of RT-2349 went to the gotchas of `rt-tools-storybook`.** The article about the three kinds of threshold it was addressed to is no longer in the rule; the gotcha about text measured in `play` is the closest neighbour. Affected stage of the plan: 1.
- **Two arguments of each rule were cut to make room.** Both rules stood over the prose weight limit after the insert; the cut parts were arguments, not statements. Affected stage of the plan: 1.

## Sessions

### 2026-10-02

- The task, the branch and the folder are created.
- Stage 1: `node tools/check-file-size.mjs` — longer than the limit 0.
