# Plan

**Task:** RT-2789 · **Branch:** RT-2765-deps-latest
**Spec:** `docs/specs/ui-kit-v2/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/`                         |
| Specs | `docs/specs/ui-kit-v2/spec.md`                                           |
| Tests | `apps/message-bus-admin-e2e/__snapshots__/`                              |
| Rules | `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/` |

## What counts as done

- On a 412px screen no toolbar field passes the window edge: SC-MB-235 and SC-MB-253 pass.
- The admin suite passes whole, every retaken frame looked at before the retake.
- The second showcase frames match.

## Stages

### 1. The toolbar field fits a narrow screen

- **Steps:**
    1. Give the left bar of the toolbar `min-width: 0` and name it in the toolbar description
    2. Run SC-MB-235 and SC-MB-253 and the second showcase frames
- **Readiness sign:** both scenarios pass, the showcase frames match
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no failed frame

### 2. The admin frames retaken

- **Steps:**
    1. Look at every diverging admin frame
    2. Retake the frames that changed only by the toolbar field width
    3. Run the admin suite whole
- **Readiness sign:** the admin suite passes whole
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e --skip-nx-cache` — `146 passed`

## What this work does not do

- It does not publish the kit; the release goes by the owner's word.
