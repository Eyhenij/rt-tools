# Plan

**Task:** RT-2556 · **Branch:** RT-2556-kit2-carousel
**Spec:** `docs/specs/ui-kit-v2/carousel/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/carousel/`                                                                                                                 |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                            |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/carousel/`, `projects/ui-kit-v2/carousel/`                                                                |

## What counts as done

- `rt-carousel` draws the cards of its input as an overlapping stack, each filled with its colour
  and its text in the tone the colour needs.
- The pointer and the focus expand a card to its whole label and move the cards after it aside.
- Every size, overlap, shift, radius, shadow, type step and duration is a `--rt-carousel-*`
  property, and the material preset gives the application's look without Material packages.
- The component is shown on :6007 with every input axis in both looks, and the frames are measured.

## Stages

### 1. Agreement

- **Steps:**
    1. Read the application's component and write what it does into the progress
    2. Write the subdomain spec, scenarios and bindings for the carousel
- **Readiness sign:** the spec check passes with the new subdomain in it
- **Verified by:** `node tools/check-specs.mjs` — exit code 0

### 2. Component and specs

- **Steps:**
    1. Write the tone choice as a pure function with its specs
    2. Write the component, its model and styles in the components layer
    3. Write the specs on the cards, the colour, the tone, the focus and an empty list
- **Readiness sign:** the new specs pass, and the types and the linter are clean
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testPathPatterns=carousel` — every test passed

### 3. Showcase

- **Steps:**
    1. Write the overview page, the matrix stories and the playground
    2. Measure the layout on :6007
- **Readiness sign:** the overview input table matches the component, the frames are measured
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergences

### 4. Snapshots and delivery

- **Steps:**
    1. Take the references of the new stories after looking at them
    2. Run the whole set and open the PR into the epic branch after the owner's word
- **Readiness sign:** all snapshots match, the PR is open into `RT-2542-kit2-app-parts`
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every snapshot passed

## What this work does not do

- The scrolling carousel with arrows and swipe the task card describes: the application has no such
  component, and the divergence is named to the owner.
- The absolute placement of the stack in a table cell: that is the application's layout.
- The application's screens: they move to the kit component on their side.
