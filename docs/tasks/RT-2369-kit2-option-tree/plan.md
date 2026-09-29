# Plan

**Task:** RT-2369 · **Branch:** RT-2369-kit2-option-tree
**Spec:** `docs/specs/ui-kit-v2/option-tree/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/option-tree/`, `docs/specs/ui-kit-v2/spec.md`      |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/rt-tools-styling/` |
| Code  | `projects/ui-kit-v2/src/lib/components/select/`, `multiselect/`          |

## What counts as done

- An option takes children of the same type, and both families draw them as a tree: an indent of
  24px per level, an arrow at a branch, an empty place at a leaf in a tree.
- A click on the arrow opens or folds a branch; a click on the label chooses by the rules of the
  subdomain; the multiselect parent's checkbox is on, partial or off by its leaves.
- The filter and the keys work in the tree as the subdomain says.
- A flat list draws and behaves as before.
- Specs, stories and snapshots cover it.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the option-tree subdomain spec
    2. Write its scenarios and binding lines
- **Readiness sign:** the spec check names the subdomain and no divergence of it
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. Tree logic

- **Steps:**
    1. Add `children` to the option type and write the shared tree module
    2. Cover the module by its spec
- **Readiness sign:** the module spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-select-tree` — all tests pass

### 3. The select

- **Steps:**
    1. Draw the tree in the select panel with arrows and indents
    2. Move the filter and the keys onto the visible rows
    3. Cover the select scenarios by its component spec
- **Readiness sign:** the select spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-select.component` — all tests pass

### 4. The multiselect

- **Steps:**
    1. Draw the tree in the multiselect panel with the derived parent checkbox
    2. Choose leaves by a parent and look chip labels up in the tree
    3. Cover the multiselect scenarios by its component spec
- **Readiness sign:** the multiselect spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-multiselect.component` — all tests pass

### 5. Showcase and docs

- **Steps:**
    1. Show the tree in the stories of both families
    2. Document the tree on the overview pages and in the component contexts
    3. Re-take the snapshots
- **Readiness sign:** the docs check and the snapshot run are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergence

### 6. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests, build and the style checks are green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2` — all targets succeed

## What this work does not do

- A tree in the autocomplete: the mockup draws none there.
- Loading children on demand: the options arrive whole.
