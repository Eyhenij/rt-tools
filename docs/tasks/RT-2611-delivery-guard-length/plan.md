# Plan

**Task:** RT-2611 · **Branch:** RT-2611-delivery-guard-length
**Behaviour:** unchanged — the guard is shortened by three lines, its refusals stay as they are. Подтверждено владельцем: «Чиню сам (Recommended)».

## Task footprint

| What  | Where                                                    |
| ----- | -------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-tree/` — read, not edited |
| Rules | `.claude/skills/agent-kit-source/`                       |
| Code  | `projects/agent-kit/assets/hooks/git-guard-delivery.sh`  |

## What counts as done

- The file length check names no file.
- The guard scenarios are green.

## Stages

### 1. Shorten the guard

- **Steps:**
    1. Take three lines out of the guard source without a change of behaviour
    2. Lay out the package and run the guard scenarios
- **Readiness sign:** the check names no divergence, the scenarios pass.
- **Verified by:** `node tools/check-file-size.mjs` — the line «no divergences».

## What this work does not do

- It does not split the guard into modules: three lines are the excess, and a split is a work of
  its own.
