# Plan

**Task:** RT-2474 · **Branch:** RT-2474-kit2-spinner-modes
**Spec:** `docs/specs/ui-kit-v2/spinner-modes/spec.md`
**Behaviour:** changes — new optional inputs; without them the spinner draws as today

## Task footprint

| What     | Where                                            |
| -------- | ------------------------------------------------ |
| Spinner  | `projects/ui-kit-v2/src/lib/components/spinner/` |
| Spec     | `docs/specs/ui-kit-v2/spinner-modes/`            |
| Showcase | the spinner stories and its overview page        |

## What counts as done

- A spinner with the overlay covers its positioned parent and stands in its centre; the plate, the
  backdrop and the arc each draw on request.
- A spinner without the new inputs keeps its markup and its frames.
- The second kit's specs, types, lint, the overview check and the snapshots are green.

## Stages

### 1. The spinner

- **Steps:**
    1. The overlay, the plate and the backdrop
    2. The arc look
- **Readiness sign:** the spinner specs are green, and the former specs pass unchanged
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/spinner`

### 2. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview table and the spinner stories for the new modes
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- A loading look of a button that hides its label — task RT-2476.
- Positioning the parent: the spinner cannot style the node above it, the overview says so.
