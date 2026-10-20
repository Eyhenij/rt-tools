# Plan

**Task:** RT-2871 · **Branch:** RT-2871-ui-kit-v2-picker-arrows
**Spec:** `docs/specs/ui-kit-v2/option-list/spec.md`

## Task footprint

| What      | Where                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| Specs     | the subdomain `docs/specs/ui-kit-v2/option-list/`                                          |
| Laws      | none                                                                                       |
| Rules     | none                                                                                       |
| Code      | `projects/ui-kit-v2/src/lib/options/`; `select`, `multiselect`, `dynamic-selector`, `tree` |
| Snapshots | none change: the keys draw nothing new                                                     |

## What counts as done

- The controller answers Home and End where the field allows them, and the select and the
  multiselect allow them.
- The dynamic selector popup moves the focus between its rows by the arrows, Home and End, and
  Enter ticks the focused row.
- `rt-tree`, and so the tree selector, moves the highlight to the first and the last row by Home
  and End while a row is highlighted.
- The spec states the keys, its new scenarios from `SC-UKV-885` are covered by tests, and the keys
  are checked in the browser on the showcase.

## Stages

### 1. The agreement

- **Steps:**
    1. Add the rules and the scenarios of the new keys to the spec `option-list`, numbered from `SC-UKV-885`.
- **Readiness sign:** the spec check sees the subdomain without divergences.
- **Verified by:** `npm run check:specs` — no divergence for `option-list`.

### 2. The keys

- **Steps:**
    1. Give the controller Home and End, and the select and the multiselect their answers.
    2. Wire the controller into the dynamic selector popup.
    3. Give `rt-tree` Home and End.
    4. Write the tests of the new scenarios and the companion lines.
- **Readiness sign:** the kit tests are green with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — green.

### 3. The check in the browser and before the push

- **Steps:**
    1. Press the keys in the showcase stories of the dynamic selector and the tree selector.
    2. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the keys move as the spec says, and the push passes.
- **Verified by:** the showcase in the browser; `git push` — the push gate lets the branch through.

## What this work does not do

- The pass-through inputs of the dynamic selector — RT-2872.
- The wrap of the arrows in `rt-tree`: it stops at the ends.
- The search by the first letter: no field has it.
