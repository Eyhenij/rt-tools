# Plan

**Task:** RT-2351 · **Branch:** RT-2351-data-list-story-height
**Behaviour:** unchanged — the owner asks for the showcase to show the list as the first kit's does; the kit code is not edited

## Task footprint

| What  | Where                                              |
| ----- | -------------------------------------------------- |
| Rules | `.claude/skills/rt-tools-storybook/`               |
| Code  | `projects/ui-kit-v2/src/lib/components/data-list/` |

## What counts as done

- In the first-kit stories of the second kit the list takes the window: the page does not scroll,
  the table scrolls inside, the page strip stays at the bottom.
- The second kit's frames match after the retake.

## Stages

### 1. The height of the list in the first-kit stories

- **Steps:**
    1. The box of the first-kit story takes the height of the window
    2. The measurement against the first kit and the retaken frames
- **Readiness sign:** the document is not taller than the window, and the table scrolls inside.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «642 passed, 642 total».

### 2. Hand-over

- **Steps:**
    1. Take the folder apart and open the PR into the epic branch
- **Readiness sign:** the PR is open into the epic branch with a reviewer.
- **Verified by:** `gh pr view --json state,baseRefName` — «OPEN» and «RT-1870-one-kit».

## What this work does not do

- The matrix stories of the list show many lists on one page and keep their natural height.
