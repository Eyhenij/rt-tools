# Plan

**Task:** RT-2904 · **Branch:** RT-2904-kit2-card-media
**Draft:** `docs/specs/ui-kit-v2/proposed/card-media/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/`                                                  |
| Laws  | `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md` |
| Code  | `projects/ui-kit-v2/src/lib/components/card/`                            |

## What counts as done

- `rt-card` takes content in the `[rtCardMedia]` slot and shows it above the title.
- An empty slot leaves the card as before.
- The unit spec and the story are green; the build of the package passes.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the draft `docs/specs/ui-kit-v2/proposed/card-media/spec.md` with scenarios.
- **Readiness sign:** the draft lies on disk with numbered scenarios.

### 2. Slot

- **Steps:**
    1. Add the slot to the card markup and styles.
    2. Extend the unit spec and the story.
- **Readiness sign:** `pnpm exec nx test @rt-tools/ui-kit-v2` and the package build are green.

### 3. Closing

- **Steps:**
    1. Merge the agreement into the subdomain spec and bind its rules.
    2. Take the folder apart into the archive.
- **Readiness sign:** `npm run check:specs` is green and no task folder lies in the branch.
