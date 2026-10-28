# Plan

**Task:** RT-2972 · **Branch:** RT-2972-kit2-footer-references
**Behaviour:** unchanged — only the snapshot references of the second kit are re-taken to the look
RT-2957 already merged. Владелец: «RT-2972 сейчас, потом RT-2965 (Recommended)».

## Task footprint

| What  | Where                                          |
| ----- | ---------------------------------------------- |
| Specs | none — no package surface changes              |
| Laws  | `docs/constitution/verifiability.md`           |
| Rules | `.claude/skills/ui-component-tests/`           |
| Code  | `projects/ui-kit-v2/.storybook/__snapshots__/` |

## What counts as done

- The snapshot check of the second kit shows no failed snapshot and no reference without a story.

## Stages

### 1. The references are re-taken

- **Steps:**
    1. Look at every diff frame against the look of RT-2957
    2. Re-take the references of the seven story files
    3. Check the rewritten references against the divergence list
- **Readiness sign:** the run reports 0 failed snapshots and no reference without a story.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no «snapshots failed» line and no
  «References that have no story» block.

## What this work does not do

- The failed E2E admin step of #2963.
