# Plan

**Task:** RT-2552 · **Branch:** RT-2552-kit2-breadcrumbs
**Spec:** `docs/specs/ui-kit-v2/breadcrumbs/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/breadcrumbs/`                                                                                                              |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                                |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/breadcrumbs/`                                                                                             |

## What counts as done

- `rt-breadcrumbs` draws a chain of crumbs from an input: ancestors as links, the last as the current
  section with `aria-current="page"`, an optional back button to the previous crumb.
- On a narrow screen the middle of the chain folds, and the folded crumbs stay reachable.
- The labels come from the kit dictionary in eight languages; the host is a navigation landmark.
- The component is shown on :6007 with every input axis, and the owner has seen it.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the subdomain spec, scenarios and bindings for the breadcrumbs
    2. Take scenario numbers from the tree command
- **Readiness sign:** the spec check passes with the new subdomain in it
- **Verified by:** `pnpm run -s check:specs` — exit code 0

### 2. Component and specs

- **Steps:**
    1. Write the component, its model and styles in the components layer
    2. Write the specs on inputs, links, the back button and the fold
- **Readiness sign:** the new specs pass, and the types and the linter are clean
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-breadcrumbs` — every test passed

### 3. Showcase

- **Steps:**
    1. Write the overview page, the matrix stories and the playground
    2. Measure the layout on :6007 and show it to the owner
- **Readiness sign:** the overview input table matches the component, the owner has seen the frames
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergences

### 4. Snapshots and delivery

- **Steps:**
    1. Take the references of the new stories after looking at them
    2. Run the whole set and open the PR into the epic branch after the owner's word
- **Readiness sign:** all snapshots match, the PR is open into `RT-2542-kit2-app-parts`
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every snapshot passed

## What this work does not do

- The other items of the epic — the inline edit, the quick menu, the palette and the carousel have
  tasks of their own.
- The application's screens: they move to the kit component on their side.
