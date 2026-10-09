# Plan

**Task:** RT-2555 · **Branch:** RT-2555-kit2-color-palette
**Spec:** `docs/specs/ui-kit-v2/color-palette/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/color-palette/`                                                                                                            |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                            |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/color-palette/`, `projects/ui-kit-v2/src/lib/i18n/`                                                       |

## What counts as done

- `rt-color-palette` is a form field with a `#rrggbb` value: the swatches choose a colour, a value
  outside the list shows as one more swatch, and read only shows one swatch.
- The swatches are a radio group with arrows, Home and End; disabled stops every press.
- The custom colour is picked in the kit's own panel: the area, the hue strip, the hex field,
  Cancel and Apply, all with keys.
- Every size, gap, ring, border and radius is a `--rt-color-palette-*` property, and the material
  preset gives the material look without Material packages.
- The component is shown on :6007 with every input axis in both looks, and the frames are measured.

## Stages

### 1. Agreement

- **Steps:**
    1. Read the application's component and write what it does into the progress
    2. Write the subdomain spec, scenarios and bindings for the palette
- **Readiness sign:** the spec check passes with the new subdomain in it
- **Verified by:** `node tools/check-specs.mjs` — exit code 0

### 2. Component and specs

- **Steps:**
    1. Write the colour maths as a pure module with its specs
    2. Write the field, the swatches and the custom colour panel in the components layer
    3. Write the specs on the value, the choice, the keys, read only, disabled and the panel
- **Readiness sign:** the new specs pass, and the types and the linter are clean
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testPathPatterns=color-palette` — every test passed

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

- The other items of the epic — the carousel has a task of its own.
- An alpha channel and RGB or HSL fields: the application keeps no alpha, and its screens read hex.
- The application's theme list: it belongs to the application and arrives by the colours input.
- The application's screens: they move to the kit component on their side.
