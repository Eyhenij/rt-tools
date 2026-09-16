# Grill

## The owner request

> влей сам все пр от моего имени через браузер, аппрувни от моего имени и влей

The order is about the stack of epic RT-2146. Its PR into `main` (#2166) is red on CI at the step
«Visual tests (ui-kit-v2)», and this task removes that obstacle. The owner's word about retaking
references was given the same day for the admin frames («Переснять эталоны»).

## What the tree already has

- `projects/ui-kit-v2/.storybook/__snapshots__/` — 479 references of the second kit's showcase,
  taken before 16 September.
- `tools/visual-gate.mjs ui-kit-v2` — the same run the pipeline step calls.
- Pattern `ui-component-tests-visual`: a change of machine or browser version means re-taking all
  the references rather than sorting out divergences.
- Retakes of the same cause made today: 22 admin frames and 5 first-kit frames, already in the
  epic branch through RT-2150. That is why this task belongs to the epic and branches from its
  branch: a branch from `main` would fail CI on those two sets as well.

## What the rules already say

- `ui-component-tests`: the retake of all references is `pnpm run test:visual:v2:update-all`
  against a raised showcase on port 6007.
- `git-workflow`: the set before sending is never narrower than the pipeline set. Here that set
  runs the second kit's snapshots only when a path under `projects/ui-kit-v2/` or the shared base
  is touched; the pipeline runs them on every PR. The gap is named here and not fixed by this
  task: it is a decision about the subject split of that set, not about frames.

## Questions and answers

None asked: the cause is measured, not guessed — `softwareupdate --history` names macOS 27 at
08:14 on 16 September, the references are older, the divergence is glyph anti-aliasing only.

## Decisions

- **All 479 references are retaken, not the 334 diverged ones.** — The pattern says so for a
  change of machine; the 145 that passed are within threshold, not byte-identical, and a mixed set
  would keep two rasterisations. Rejected: a pointed retake of 334.
- **The task is the fifth of epic RT-2146.** — Its frames sit next to the two retakes already in
  the epic branch, and the epic PR is what its CI must turn green. Rejected: a task outside the
  epic from `main` — CI on that PR would be red on the admin and first-kit frames too.
