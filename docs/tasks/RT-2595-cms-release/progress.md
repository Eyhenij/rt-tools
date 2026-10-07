# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The workflows
- **Done:** the three publication workflows, PR #2621 into main (a draft until its run is green)
- **Next step:** 1.2 — make #2621 ready on its green run; the owner merges it, then 2.1 runs the
  contract workflow on the epic branch
- **Uncommitted:** nothing
- **Waiting for the owner:** the run of #2621 is red on the image build of another app (#2612,
  #2615), the same on every PR into main; whether to hand #2621 in with that noted, hand in the
  #2612 Dockerfile fix that lies uncommitted in `/Users/eyhenij/WebstormProjects/rt-cms-workflows`
  (the image builds with it, the start still fails on #2615), or wait
- **PR:** #2621 into main — the workflows; the task PR into the epic branch is not open yet

## Steps

- [x] 1.1 Write the three publication workflows after the auth server one
- [>] 1.2 Open the PR of the workflows into main
- [ ] 2.1 Run the contract workflow on the epic branch
- [ ] 3.1 Replace the `workspace:*` links with `^0.1.0` and update the lockfile
- [ ] 3.2 Run the server and the Angular workflows on the task branch

## Decisions along the way

- **The delivery and plan guards are bypassed for this epic.** The owner's words: «Да, на весь
  эпик», «Обходи и его на весь эпик».

## Sessions

### 2026-10-07

- The task taken after RT-2594 was merged.
