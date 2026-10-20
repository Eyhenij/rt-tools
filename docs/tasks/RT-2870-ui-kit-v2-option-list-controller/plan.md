# Plan

**Task:** RT-2870 · **Branch:** RT-2870-ui-kit-v2-option-list-controller
**Spec:** `docs/specs/ui-kit-v2/option-list/spec.md`

## Task footprint

| What      | Where                                                                          |
| --------- | ------------------------------------------------------------------------------ |
| Specs     | a new subdomain `docs/specs/ui-kit-v2/option-list/`                            |
| Laws      | none                                                                           |
| Rules     | none                                                                           |
| Code      | `projects/ui-kit-v2/src/lib/options/`; `select`, `multiselect`, `autocomplete` |
| Snapshots | none change: the keys draw nothing new                                         |

## What counts as done

- One option-list controller in `src/lib/options`: the active option, the opening keys, the action
  of a key in an open list, the option id and the scroll to it.
- `rt-select`, `rt-multiselect` and `rt-autocomplete` declare no `OPEN_KEYS`, `#moveActive` or
  option id of their own, and their present tests stay green.
- The subdomain spec states the keys, and its scenarios are covered by tests of the controller
  that draw no component.

## Stages

### 1. The agreement

- **Steps:**
    1. Write the subdomain spec `option-list` with its scenarios, numbered from `SC-UKV-880`.
- **Readiness sign:** the spec check sees the new subdomain without divergences.
- **Verified by:** `npm run check:specs` — no divergence for `option-list`.

### 2. The controller

- **Steps:**
    1. Write the controller in `src/lib/options` with tests that draw no component.
    2. Move the select, the multiselect and the autocomplete onto it.
    3. Write the companion of the spec.
- **Readiness sign:** no field keeps its own list keyboard.
- **Verified by:** `grep -rn -E "OPEN_KEYS|#moveActive" projects/ui-kit-v2/src/lib/components` — no lines; `pnpm exec nx test @rt-tools/ui-kit-v2` — green.

### 3. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- The arrows in the dynamic selector and the tree selector — RT-2871.
- `rt-menu` and `rt-tree`: the menu keeps its own key manager, the tree its branch keys.
- Home, End and the search by the first letter: no field has them today.
