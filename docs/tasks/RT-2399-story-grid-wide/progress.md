# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Closing
- **Done:** the rule and scenario SC-UKV-490, the grid without its own scroll, the spec, two radius stories, the two frames re-taken
- **Next step:** the full suite
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the rule and scenario SC-UKV-490 about the grid helper to the snapshots spec
- [x] 2.1 Remove the scroll wrapper from the grid helper
- [x] 2.2 Write the spec SC-UKV-490 for the grid helper
- [x] 3.1 Merge the radius grid into two stories of ten columns
- [x] 3.2 Delete the references of the removed stories
- [x] 4.1 Run the full frame check and look at every diverged frame
- [x] 4.2 Re-take the looked-at frames
- [x] 4.3 Confirm the frames by a second raising
- [>] 5.1 Run the full suite
- [ ] 5.2 Take the task folder apart into the archive

## Decisions along the way

- **The spec check of stage 1 went clean only after stage 2.** The scenario names its test, and the test is written in stage 2. Affected stage of the plan: 1.

## Sessions

### 2026-09-30

- The branch is taken from RT-2398-table-radius; the card is in progress.
- The first frame check: only the two radius frames diverged, 2763 and 2795 px wide instead of 1248; all ten columns are in them. No other grid was clipped at the base window.
- The second raising: 670 frames of 670.
