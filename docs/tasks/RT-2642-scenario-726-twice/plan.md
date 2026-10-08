# Plan

**Task:** RT-2642 · **Branch:** RT-2642-scenario-726-twice
**Behaviour:** unchanged — the owner's word «Довести эпик CMS»: only a scenario number moves, so the epic branch can be pushed

## Task footprint

| What  | Where                                 |
| ----- | ------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/toolbar-dense/` |
| Rules | `.claude/skills/spec-driven/`         |
| Code  | `projects/ui-kit-v2/`                 |

## What counts as done

- The spec check finds no scenario number taken twice.

## Stages

### 1. Renumber the dense-toolbar scenario

- **Steps:**
    1. Rename the dense-toolbar scenario and its bindings to SC-UKV-727
    2. Run the spec check
- **Readiness sign:** `check-specs` prints no divergence
- **Verified by:** `node tools/check-specs.mjs` — no line about SC-UKV-726 being taken

## What this work does not do

- The CMS epic PR into main — opened by the epic after this task is merged.
