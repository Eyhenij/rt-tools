# Plan

**Task:** RT-2695 · **Branch:** RT-2695-ai-run-status-shimmer
**Spec:** `docs/specs/ui-kit-v2/ai-run-status/`
**Behaviour:** changes — the highlight of the running label

## What counts as done

- The highlight passes in 2.4 s and flows through four colours.

## Stages

### 1. The highlight

- **Steps:**
    1. Change the gradient and the pass
    2. Update the spec, CONTEXT.md and Overview.mdx
    3. Shoot the frames and look at them
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — successful run
