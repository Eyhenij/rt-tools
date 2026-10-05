# Plan

**Task:** RT-2526 · **Branch:** RT-2526-kit2-label-descender-clip
**Spec:** `docs/specs/ui-kit-v2/field-descenders/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/field-descenders/`                                   |
| Laws  | `docs/constitution/frontend-application.md`, `verifiability.md`            |
| Rules | `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/`   |
| Code  | `projects/ui-kit-v2/src/styles/`, `projects/ui-kit-v2/src/lib/components/` |

## What counts as done

- The text in every field of the second kit shows its descenders whole at every size and in both
  presets, and no field changes its height.
- A story shows that, and every re-taken frame is looked over.

## Stages

### 1. Line height

- **Steps:**
    1. The spec of the subdomain, its scenarios and bindings
    2. The story with descender text in every field
    3. The field line height and the components the story shows clipped
- **Readiness sign:** the kit's specs pass, the token checks pass and the spec check knows the new
  scenarios
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test -p @rt-tools/ui-kit-v2` — all passed; `npm run check:specs` — exit 0

### 2. Frames

- **Steps:**
    1. The new story frame and the re-taken field frames, looked over
    2. The full frame audit and the sweep
- **Readiness sign:** the full snapshot audit and the story sweep pass
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every snapshot passed; `pnpm run test:stories:v2` — no empty showings

## What this work does not do

- The first kit is not touched.
- Line heights of headings, menus and tables stay as they are unless the story shows them clipped.
