# Plan

**Task:** RT-2899 · **Branch:** RT-2899-kit2-service-logo
**Draft:** `docs/specs/ui-kit-v2/proposed/service-logo/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                                                                                                                               |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                 |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/service-logo/`                                                                                                 |

## What counts as done

- `rt-service-logo` draws one or several marks in circles of three sizes with the numbers of the
  atom «Service Logo».
- A mark comes as an image address or as a kit icon name, each with a label for a screen reader.
- The unit spec, the visual snapshot and the story are green; the build of the package passes.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the draft `docs/specs/ui-kit-v2/proposed/service-logo/spec.md` with scenarios.
- **Readiness sign:** the draft lies on disk with numbered scenarios.

### 2. Component

- **Steps:**
    1. Write the component, its model, styles and tokens.
    2. Write the unit spec, the story, the overview page and the visual snapshot.
- **Readiness sign:** `pnpm exec nx test @rt-tools/ui-kit-v2` and the package build are green.

### 3. Closing

- **Steps:**
    1. Merge the agreement into the subdomain spec and bind its rules.
    2. Take the folder apart into the archive.
- **Readiness sign:** `npm run check:specs` is green and no task folder lies in the branch.
