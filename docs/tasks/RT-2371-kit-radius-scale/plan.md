# Plan

**Task:** RT-2371 · **Branch:** RT-2371-kit-radius-scale
**Draft:** `docs/specs/ui-kit-v2/proposed/radius-scale/`
**Behaviour:** changes

## Task footprint

| What     | Where                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| Specs    | `docs/specs/ui-kit-v2/proposed/radius-scale/`, `docs/specs/ui-kit-v2/tag/`, `docs/specs/ui-kit-v2/tokens/` |
| Laws     | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`                            |
| Rules    | `.claude/skills/rt-tools-styling/`, `.claude/skills/styling-bem/`                                          |
| Code     | `projects/ui-kit-v2/src/lib/`, `projects/ui-kit-v2/src/styles/_mixins.scss`                                |
| Showcase | `projects/ui-kit-v2/src/lib/components/*/stories/`, `projects/ui-kit-v2/.storybook/__snapshots__/`         |

## What counts as done

- The kit exports one step type with the whole scale — none, xs, sm, ms, md, lg, xl, 2xl, full.
- Every component with a surface takes the one input `radius` of that type; without it the component
  keeps its own default, and the default matches the mockup collection «RT / Shape».
- The old shape inputs — the tag's `shape` and `radius`, the icon button's `shape`, the button's
  `rounded`, the skeleton's `borderRadius` — are folded into `radius`; the skeleton's geometry
  (`circle`, `square`) stays.
- No component rounding stands off the scale: the button's `999px` and `50%`, the toggle group's
  `12px` are gone.
- The showcase shows every such component at every step; the snapshots are re-taken.
- The unit tests, the linters, the style checks and the build are green.

## Stages

### 1. The agreement

- **Steps:**
    1. Write the feature spec of the one rounding input
    2. Write its scenarios and the binding table
- **Readiness sign:** `check:specs` lists `docs/specs/ui-kit-v2/proposed/radius-scale` without an error
- **Verified by:** `npm run check:specs` — the line of the new agreement stands, no refusal

### 2. The shared mechanism

- **Steps:**
    1. Add the step type and the host directive with the `radius` input
    2. Add the SCSS mixin that maps a step to the component's own property
    3. Cover the directive with a unit spec
- **Readiness sign:** the directive spec passes and the package builds
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-radius.directive.spec.ts` — the spec passes

### 3. The old shape inputs folded

- **Steps:**
    1. Fold the tag's `shape` and `radius` into `radius`
    2. Fold the icon button's `shape` into `radius`
    3. Fold the button's `rounded` and its kit setting into `radius`
    4. Fold the skeleton's `borderRadius` into `radius`, the wrapper too
    5. Move the kit's own callers to the new input
- **Readiness sign:** no old input is left in the kit, the tests of the four components pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — every suite passes

### 4. The input on the rest of the components

- **Steps:**
    1. Controls: split button, toggle group, toggle switch, checkbox, radio card, input, textarea, input number, select, multiselect, autocomplete, date picker
    2. Surfaces: card, dialog, confirm popover, bottom sheet, toast, tooltip, message, note, menu, file card, file drop, markdown text, money list, action bar, stepper, table, photo viewer, calendar, pagination, section nav, header, notifications bell, thread list, empty state
    3. Defaults brought to the mockup and off-scale values replaced by steps
- **Readiness sign:** every listed component carries the directive and the mixin; tests pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — every suite passes

### 5. The showcase and the texts

- **Steps:**
    1. A showcase page with every component at every step
    2. The stories of the four folded components moved to `radius`
    3. The component descriptions, the README and the changelog brought up to date
    4. The snapshots re-taken
- **Readiness sign:** the visual run is green on the new references
- **Verified by:** `pnpm run test:visual:v2` — no frame diverges

### 6. Closing

- **Steps:**
    1. The agreement merged into the domain spec
    2. The full set of checks run
- **Readiness sign:** lint, style lint, token style check, cascade layer check, typecheck and build green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2 && pnpm run lint:styles && pnpm run check:tokens-styles && pnpm run check:cascade-layer` — all exit 0

## What this work does not do

- The rounding of overlay panels (select panel, menu panel, tooltip, dropdown) stays on its own
  shared names: the panel is a separate part in the mockup, and the next tasks of the epic touch it.
- The material preset keeps its own control rounding (`1.5rem`): the preset is a separate look.
- The shared style layer (`_form.scss`, `_login.scss`, `_scrollbar.scss`, the `surface-card` mixin)
  keeps direct steps: it is not a component and has no input.
- The first kit is not touched.
