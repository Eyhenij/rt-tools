# Plan

**Task:** RT-2742 · **Branch:** RT-2742-kit2-app-rows-122-132
**Spec:** `docs/specs/ui-kit-v2/side-menu-options/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/side-menu-options/`, `docs/specs/ui-kit-v2/toast-options/`                                                                         |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md`                                                                                    |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/ui-component-tests/`                                                                                     |
| Code  | `projects/ui-kit-v2/src/lib/components/side-menu/`, `projects/ui-kit-v2/src/lib/components/toast/`, `projects/ui-kit-v2/src/lib/components/scroll-area/` |

## What counts as done

- The branch from main carries the first kit's look of the side menu and rows 122–132, and nothing
  of the epic RT-2542.
- The specs, the types and the snapshots of the second kit are green on it.
- The PR into main is open, author treble3d, reviewer Eyhenij.

## Stages

### 1. Carrying the commits

- **Steps:**
    1. Pick the seven commits onto the branch from main
    2. Retake the icon frames against main's icon set
- **Readiness sign:** the side menu, toast and scroll area specs pass on the branch
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — every test passed

### 2. Checks and delivery

- **Steps:**
    1. Run the whole snapshot set of the second kit
    2. Take the task folders apart and open the PR into main
- **Readiness sign:** all snapshots match, the PR is open into `main`
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every snapshot passed

## What this work does not do

- The epic RT-2542 and its trees: they go into main by the epic's own PR.
- Publishing the package: a separate manual run after the merge.
