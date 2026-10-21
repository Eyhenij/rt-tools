# Plan

**Task:** RT-2919 · **Branch:** RT-2919-copy-cell-first-hover
**Draft:** `docs/specs/ui-kit-v2/proposed/copy-cell-first-hover/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                                                           |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/testing/`                                                         |
| Code  | `projects/ui-kit-v2/src/lib/components/table/copy-cell/`                          |

## What counts as done

- A test hovers a cut copy cell once, the way the browser does, and sees the hint with the whole value.

## Stages

### 1. The hint from the first hover

- **Steps:**
    1. The test SC-UKV-882 hovers host and span with no change detection between.
    2. The cell updates its view right after the measurement.
- **Readiness sign:** the test of the cell is green, and it was red before the fix.

### 2. Closing

- **Steps:**
    1. The agreement merges into the spec of the second kit.
    2. The task folder is taken apart, the PR opens.
- **Readiness sign:** `pnpm run check:specs` is clean, the PR is open.
