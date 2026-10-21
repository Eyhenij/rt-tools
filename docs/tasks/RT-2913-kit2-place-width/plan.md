# Plan

**Task:** RT-2913 · **Branch:** RT-2913-kit2-place-width
**Spec:** `docs/specs/ui-kit-v2/place-width/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/place-width/`, `docs/specs/ui-kit-v2/spec.md`                                                |
| Code  | `projects/ui-kit-v2/src/lib/platform/`, `projects/ui-kit-v2/src/styles/`, `projects/ui-kit-v2/src/lib/components/` |

## What counts as done

- A component inside the page frame switches its look by the frame width.
- Without the frame the look switches by the window, as before.
- Overlays keep switching by the window.

## Stages

### 1. Agreement

- **Steps:**
    1. Spec subdomain with rules and scenarios
- **Readiness sign:** the subdomain row stands in the spec index
- **Verified by:** `npm run check:specs` — no red line about the subdomain

### 2. Place width in code

- **Steps:**
    1. Named container on the frame and on the root, mixin for the query
    2. Component styles moved to the mixin
    3. Breakpoint service reads the frame width
- **Readiness sign:** unit tests of the service and the frame are green
- **Verified by:** `npx jest -c projects/ui-kit-v2/jest.config.ts breakpoints container` — all pass

### 3. Showcase and frames

- **Steps:**
    1. Story of a narrow frame in a wide window
    2. Snapshots updated and looked at
- **Readiness sign:** the new story shows the narrow look inside a wide window
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no unexpected difference

## What this work does not do

- The application's own styles and code that read the window: the application converts them by
  its own task.
