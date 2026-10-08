# Plan

**Task:** RT-2650 · **Branch:** RT-2650-ai-chat-icons
**Spec:** `docs/specs/ui-kit-v2/proposed/material-preset/`
**Behaviour:** changes — three new icon names

## Task footprint

| What  | Where                                                                                 |
| ----- | ------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/material-preset/implementation.md`                     |
| Code  | `projects/ui-kit-v2/src/assets/icons*`, `projects/ui-kit-v2/src/lib/components/icon/` |

## What counts as done

- `<rt-icon name="sparkle|thumb-up|thumb-down">` and the glyphs `auto_awesome`, `thumb_up`,
  `thumb_down` draw in both sets.

## Stages

### 1. Add the three icons

- **Steps:**
    1. Draw the own SVGs and add the names to the union
    2. Add the pairs and fetch the Material drawings
    3. Re-shoot the icon frames and look at them
- **Readiness sign:** `check-icon-map` passes, the frames show the three icons
- **Verified by:** `node tools/check-icon-map.mjs && pnpm run test:visual:v2` — successful run

## What this work does not do

- The components that use the icons — tasks RT-2651…RT-2654.
