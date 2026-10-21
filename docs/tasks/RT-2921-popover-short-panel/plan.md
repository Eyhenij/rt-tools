# Plan

**Task:** RT-2921 · **Branch:** RT-2921-popover-short-panel
**Draft:** `docs/specs/ui-kit-v2/proposed/popover-short-panel/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                                                           |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/testing/`                                                         |
| Code  | `projects/ui-kit-v2/src/lib/components/popover/`                                  |

## What counts as done

- A short panel in the fit-viewport mode is as high as its content, and the fit decision still
  uses the threshold of 120.

## Stages

### 1. The panel as high as its content

- **Steps:**
    1. The test SC-UKV-883 opens a panel in the mode and reads the config and the pane style.
    2. The directive clears the pane minimum height after each sizing.
- **Readiness sign:** the popover test is green, and it was red before the fix.

### 2. Closing

- **Steps:**
    1. The agreement merges into the spec of the second kit.
    2. The task folder is taken apart, the PR opens.
- **Readiness sign:** `pnpm run check:specs` is clean, the PR is open.
