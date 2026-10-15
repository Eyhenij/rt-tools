# Plan

**Task:** RT-2842 · **Branch:** RT-2842-profile-menu
**Draft:** `docs/specs/ui-kit-v2/proposed/profile-menu/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/`                                                                                                                                      |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`                                                                              |
| Code  | `projects/ui-kit-v2/src/lib/components/`, `projects/ui-kit-v2/src/lib/i18n/`, `projects/ui-kit-v2/src/showcase/templates/`, `projects/ui-kit-v2/.storybook/` |

## What counts as done

- `rt-profile-menu` is exported by its own entry point of the package.
- The showcase bookings screen draws its header popup with `rt-profile-menu`, and the showcase
  component and its styles are gone.
- Scenarios SC-UKV-857…862 have unit tests, and they are green.
- The kit lint, the style lint, the tests and the build are green; the visual gate of the pipeline
  is green on the branch.

## Stages

### 1. The component in the kit

- **Steps:**
    1. Add the `profileMenu*` labels to the English kit set and the Russian showcase set
    2. Write `rt-profile-menu` with its model, template and styles, and its entry point
    3. Write the unit tests of SC-UKV-857…862
- **Readiness sign:** the tests of the component pass, and the package builds.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testPathPatterns=profile-menu` — every
  test passes; `pnpm exec nx build @rt-tools/ui-kit-v2` — the build ends with success

### 2. The showcase on the component

- **Steps:**
    1. Put `rt-profile-menu` into the bookings screen instead of the showcase component
    2. Remove the showcase component and its style layer
    3. Write CONTEXT.md and Overview.mdx of the component
- **Readiness sign:** nothing in the tree names the showcase component.
- **Verified by:** `grep -rn "app-profile-menu" projects/ui-kit-v2` — empty output

### 3. Closing

- **Steps:**
    1. Merge the agreement into the kit spec
    2. Run the kit lint, the style lint, the tests and the build
- **Readiness sign:** all green, the proposed directory is gone.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2 && pnpm run lint:styles` — exit code 0

## What this work does not do

- The release of the package version and its use in the consumer application: after the merge, by
  the owner's order.
