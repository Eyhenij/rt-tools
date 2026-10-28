# Plan

**Task:** RT-2978 · **Branch:** RT-2978-ai-chat-references
**Behaviour:** unchanged — only the snapshot references of the ai-chat stories are re-taken to the
look RT-2958 already merged. Владелец: «RT-2972 сейчас, потом RT-2965 (Recommended)».

## Task footprint

| What  | Where                                          |
| ----- | ---------------------------------------------- |
| Specs | none — no package surface changes              |
| Laws  | `docs/constitution/verifiability.md`           |
| Rules | `.claude/skills/ui-component-tests/`           |
| Code  | `projects/ui-kit-v2/.storybook/__snapshots__/` |

## What counts as done

- The second kit snapshot check shows no failed snapshot.

## Stages

### 1. The ai-chat references are re-taken

- **Steps:**
    1. Look at every ai-chat diff frame
    2. Re-take the references of the ai-chat story file
    3. Confirm them by a second full run
- **Readiness sign:** the run reports 0 failed snapshots.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no «snapshots failed» line.

## What this work does not do

- Any story outside ai-chat.
