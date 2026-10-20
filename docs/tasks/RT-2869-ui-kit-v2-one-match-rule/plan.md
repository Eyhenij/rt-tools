# Plan

**Task:** RT-2869 · **Branch:** RT-2869-ui-kit-v2-one-match-rule
**Spec:** `docs/specs/ui-kit-v2/search-match/spec.md`

## Task footprint

| What      | Where                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs     | a new subdomain `docs/specs/ui-kit-v2/search-match/`; the search rules of `option-tree`, `side-menu`, `tree-selector`, `dynamic-selector`             |
| Laws      | none                                                                                                                                                  |
| Rules     | none                                                                                                                                                  |
| Code      | `projects/ui-kit-v2/src/lib/options/`; the search of the side menu, the tree walk, the dynamic selector, the tree selector; the highlight of the chat |
| Snapshots | none change: no story types a query                                                                                                                   |

## What counts as done

- One match function and one highlight function in `src/lib/options`: every word of the query, in
  any order, case-insensitive, «ё» equal to «е».
- The side menu, the tree walk (select, multiselect, tree), the dynamic selector and the tree
  selector filter by that function; the tag, the tree, the side menu, the dynamic selector and the
  chat highlight by the other.
- The subdomain spec states the rule, its scenarios are covered by tests, and the specs of the
  places no longer promise a phrase search.

## Stages

### 1. The agreement

- **Steps:**
    1. Write the subdomain spec `search-match` with its scenarios and companion, numbered from `SC-UKV-874`.
    2. Rewrite the search rules of the places that promised a phrase search.
- **Readiness sign:** the spec check sees the new subdomain without divergences.
- **Verified by:** `npm run check:specs` — no divergence for `search-match`.

### 2. The shared rule

- **Steps:**
    1. Write the match and the highlight functions in `src/lib/options` with tests on word order, case and «ё».
    2. Switch the six places to them and remove their own copies.
- **Readiness sign:** no search place lowercases and compares text on its own.
- **Verified by:** `grep -rn -E "toLowerCase\(\)\.includes|text\.includes\(word\)" projects/ui-kit-v2/src/lib/components` — no lines; `pnpm exec nx test @rt-tools/ui-kit-v2` — green.

### 3. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- The option-list controller — RT-2870.
- A search by the description or the badges where a place searches by the label alone today.
