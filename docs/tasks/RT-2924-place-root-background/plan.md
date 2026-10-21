# Plan

**Task:** RT-2924 · **Branch:** RT-2924-place-root-background
**Spec:** `docs/specs/ui-kit-v2/place-width/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                              |
| ----- | ---------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/place-width/`                                                |
| Rules | `.claude/skills/ui-component-tests/`                                               |
| Code  | `projects/ui-kit-v2/src/styles/`, `projects/ui-kit-v2/src/lib/components/toolbar/` |

## What counts as done

- The document root carries no container declaration, and the page background of `body` fills the
  window again.
- A kit node outside `.rt-container` still counts its thresholds from the window.
- The admin end-to-end suite and the second kit's showcase snapshots are green.

## Stages

### 1. The window fallback replaces the root place

- **Steps:**
    1. Remove the root declaration and its forward from the kit styles
    2. Give `place-max` and `place-min` a window fallback for nodes outside `.rt-container`
    3. Move the toolbar call of `place-max` inside a selector
    4. Bind the spec rule about the window to the mixins
- **Readiness sign:** the kit builds, and `check:specs` passes.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:build` — the build ends without errors

### 2. The screens are checked

- **Steps:**
    1. Run the admin end-to-end suite
    2. Run the second kit's showcase snapshots
- **Readiness sign:** both are green.
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — «0 failed»

## What this work does not do

- The release of the fixed kit edition goes after the epic reaches the main branch.
