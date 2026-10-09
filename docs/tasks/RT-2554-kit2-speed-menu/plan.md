# Plan

**Task:** RT-2554 · **Branch:** RT-2554-kit2-speed-menu
**Spec:** `docs/specs/ui-kit-v2/speed-menu/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/speed-menu/`                                                                                                               |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                            |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/speed-menu/`, `popover/`, `icon-button/`                                                                  |

## What counts as done

- `rt-speed-menu` draws a round trigger; a press opens round action buttons up, down, to the start
  or to the end, and the trigger shows a cross while open.
- A chosen action goes out by an output; Escape, a press outside and a second press on the trigger
  close the menu, and Escape returns the focus to the trigger.
- The keyboard opens the menu into its first action, and the arrows move between the actions.
- `rtPopover` and `rt-icon-button` keep their present look and behaviour without the new inputs.
- The component is shown on :6007 with every input axis, and the frames are measured.

## Stages

### 1. Agreement

- **Steps:**
    1. Read the application's component and write what it does into the progress
    2. Write the subdomain spec, scenarios and bindings for the quick menu
- **Readiness sign:** the spec check passes with the new subdomain in it
- **Verified by:** `node tools/check-specs.mjs` — exit code 0

### 2. Component and specs

- **Steps:**
    1. Give `rtPopover` the positions input and `rt-icon-button` the expanded input
    2. Write the component, its model and styles in the components layer
    3. Write the specs on the opening, the directions, the choice, the closing and the keys
- **Readiness sign:** the new specs pass, and the types and the linter are clean
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=speed-menu` — every test passed

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

- The other items of the epic — the palette and the carousel have tasks of their own.
- A place in a corner of the window: the application places the menu where it needs it.
- The application's screens: they move to the kit component on their side.
