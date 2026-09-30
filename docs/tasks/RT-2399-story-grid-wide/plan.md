# Plan

**Task:** RT-2399 · **Branch:** RT-2399-story-grid-wide
**Spec:** `docs/specs/ui-kit-v2/snapshots/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What     | Where                                                                            |
| -------- | -------------------------------------------------------------------------------- |
| Specs    | `docs/specs/ui-kit-v2/snapshots/` — a rule and a scenario about the grid helper  |
| Rules    | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`       |
| Showcase | `projects/ui-kit-v2/src/showcase/` — the grid helper, the radius stories         |
| Frames   | `projects/ui-kit-v2/.storybook/__snapshots__` — the radius frames, clipped grids |

## What counts as done

- The grid helper does not scroll its matrix inside itself; a spec guards that.
- The radius grid is two stories, controls and surfaces, of ten columns each, and each frame shows
  all ten columns.
- Every other frame that changed was clipped before, and it is looked at before it is re-taken.
- The full check of the second kit's frames matches on a second raising.

## Stages

### 1. Agreement

- **Steps:**
    1. Add the rule and scenario SC-UKV-490 about the grid helper to the snapshots spec
- **Readiness sign:** the spec check names no divergence of the second kit
- **Verified by:** `npm run -s check:specs` — the output names no divergence

### 2. The grid helper

- **Steps:**
    1. Remove the scroll wrapper from the grid helper
    2. Write the spec SC-UKV-490 for the grid helper
- **Readiness sign:** the spec passes, and the kit's lint and types are clean
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test -p @rt-tools/ui-kit-v2` — every target passes

### 3. The radius stories

- **Steps:**
    1. Merge the radius grid into two stories of ten columns
    2. Delete the references of the removed stories
- **Readiness sign:** the showcase has two radius stories and no reference without a story
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test -p @rt-tools/ui-kit-v2` — every target passes

### 4. Frames

- **Steps:**
    1. Run the full frame check and look at every diverged frame
    2. Re-take the looked-at frames
    3. Confirm the frames by a second raising
- **Readiness sign:** the second raising matches every frame
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — the output names no diverged frame

### 5. Closing

- **Steps:**
    1. Run the full suite
    2. Take the task folder apart into the archive
- **Readiness sign:** the suite is green and the folder is gone from the branch
- **Verified by:** `pnpm run check:all` — every project passes

## What this work does not do

- A grid wider than a pinned threshold window stays clipped in that frame. No story needs it today.
