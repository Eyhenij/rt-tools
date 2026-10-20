# Plan

**Task:** RT-2903 · **Branch:** RT-2903-page-header-more
**Spec:** `docs/specs/ui-kit-v2/page-header-more/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                |
| ----- | ---------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                              |
| Code  | `projects/ui-kit-v2/src/lib/components/page-header/` |

## What counts as done

- The full header stands in one row, and the sections that do not fit go into «More» at its end.
- The unit specs, the snapshots of the header stories and the package build are green.

## Stages

### 1. Component

- **Steps:**
    1. Write the fit, the «More» item and its panel.
    2. Write the unit spec, the story and the snapshots.
- **Readiness sign:** `npm run check:specs` is green and the header tests pass.

### 2. Closing

- **Steps:**
    1. Write the subdomain spec and bind its rules.
    2. Take the folder apart into the archive.
- **Readiness sign:** no task folder lies in the branch.
