# Plan

**Task:** RT-2448 · **Branch:** RT-2448-story-themes-wrap
**Behaviour:** unchanged — an edit of the showcase harness, not of a kit component; the owner's word: «Взять обе по очереди»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What      | Where                                                         |
| --------- | ------------------------------------------------------------- |
| Showcase  | `projects/ui-kit-v2/src/showcase/story-themes.component.scss` |
| Rules     | `.claude/skills/rt-tools-storybook/SKILL.md`                  |
| Snapshots | the references of the second showcase that the edit moves     |

## What counts as done

- The halves of the themes pair stand side by side when both fit and one under the other when
  not, and a half never shrinks below its content unless asked to fill.
- Every reference the edit moved is looked at and re-taken; the rest match.
- The showcase rule no longer names the fixed track as a miss.

## Stages

### 1. The pair wraps

- **Steps:**
    1. Move the themes panes from the grid to a wrapping row
    2. Remove the fixed-track item from the showcase rule
- **Readiness sign:** the style linter passes
- **Verified by:** `pnpm exec stylelint projects/ui-kit-v2/src/showcase/story-themes.component.scss` — no findings

### 2. The frames

- **Steps:**
    1. Run the snapshots of the second showcase
    2. Look at every moved frame and re-take it
    3. Confirm the re-taken frames by a second raising
- **Readiness sign:** the snapshot run of the second showcase matches whole
- **Verified by:** `pnpm run test:visual:v2` — no divergence

### 3. Closing

- **Steps:**
    1. Run the full suite
    2. Take the task folder apart into the archive
- **Readiness sign:** the suite is green and the folder is gone from the branch
- **Verified by:** `pnpm run check:all` — every project passes

## What this work does not do

- The first kit's showcase: it has no themes pair of this kind.
