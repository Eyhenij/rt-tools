# Plan

**Task:** RT-3005 · **Branch:** RT-3005-pageheadermore-shot-race
**Behaviour:** unchanged — the edit is in the showcase helper, which does not ship in the package; the owner: «Do this task here»

## Task footprint

| What  | Where                                              |
| ----- | -------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                            |
| Laws  | `docs/constitution/verifiability.md`               |
| Rules | `.claude/skills/ui-component-tests/`               |
| Code  | `projects/ui-kit-v2/src/showcase/story-overlay.ts` |

## What counts as done

- The overlay gesture of a story waits until the fonts of the page are loaded.
- The frame of the story PageHeaderMore › More matches its reference five runs in a row without a
  re-take.

## Stages

### 1. The gesture waits for the fonts

- **Steps:**
    1. Make the gesture of the overlay helper wait for the page fonts
    2. Run the showcase specs and the types
- **Readiness sign:** the helper waits for the page fonts after the first layout and before the
  gesture.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — exit code 0.

### 2. The frame is steady

- **Steps:**
    1. Run the PageHeaderMore frames five times in the image
    2. Run the whole snapshot set of the second kit once
- **Readiness sign:** five green runs of the story file, the whole set without new divergences.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no failed tests.
