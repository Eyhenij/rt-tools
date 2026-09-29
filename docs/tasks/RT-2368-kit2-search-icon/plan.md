# Plan

**Task:** RT-2368 · **Branch:** RT-2368-kit2-search-icon
**Spec:** `docs/specs/ui-kit-v2/select/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/select/`                                  |
| Rules | `.claude/skills/rt-tools-storybook/`                            |
| Code  | `projects/ui-kit-v2/src/lib/components/select/`, `multiselect/` |

## What counts as done

- The filter line of the select panel shows the magnifier on the left.
- The multiselect takes `iconLeft` and draws it on the left of its trigger, as the select does.
- The select subdomain promises both, with scenarios covered by the component specs.
- The showcase shows the multiselect with and without the icon and the select panel with the
  filter; the snapshots are re-taken.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the two rules into the select subdomain spec
    2. Write their scenarios and binding lines
- **Readiness sign:** the spec check lists no divergence for the select subdomain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. Code

- **Steps:**
    1. Put the magnifier into the select filter
    2. Add `iconLeft` to the multiselect
    3. Cover both scenarios by the component specs
- **Readiness sign:** the select and multiselect specs pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=multiselect` — all tests pass

### 3. Showcase and docs

- **Steps:**
    1. Show the multiselect icon in the matrix and document the input
    2. Re-take the snapshots
- **Readiness sign:** the docs check and the snapshot run are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergence

### 4. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests, build and the style checks are green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2` — all targets succeed

## What this work does not do

- The tree of options in the select and the multiselect — task RT-2369.
- The autocomplete: it already takes `iconLeft`.
