# Plan

**Task:** RT-2553 · **Branch:** RT-2553-kit2-inline-edit
**Spec:** `docs/specs/ui-kit-v2/inline-edit/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/inline-edit/`                                                                                                              |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                                |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/inline-edit/`                                                                                             |

## What counts as done

- `rt-inline-edit` shows a value at rest and turns into the kit field with «Save» and «Cancel» on a
  press; Enter saves, Escape cancels, and the value at rest comes back unchanged after a cancel.
- The new value goes out by an output; the application may keep the field open while it saves.
- The labels come from the kit dictionary in eight languages; every control carries `qa-dataid`.
- The component is shown on :6007 with every input axis, and the frames are measured.

## Stages

### 1. Agreement

- **Steps:**
    1. Read the application's component and write what it does into the progress
    2. Write the subdomain spec, scenarios and bindings for the inline edit
- **Readiness sign:** the spec check passes with the new subdomain in it
- **Verified by:** `pnpm run -s check:specs` — exit code 0

### 2. Component and specs

- **Steps:**
    1. Write the component, its model and styles in the components layer
    2. Write the specs on the rest, the edit, the keys, the save and the cancel
- **Readiness sign:** the new specs pass, and the types and the linter are clean
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-inline-edit` — every test passed

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

- The other items of the epic — the quick menu, the palette and the carousel have tasks of their own.
- The application's screens: they move to the kit component on their side.
