# Plan

**Task:** RT-2476 · **Branch:** RT-2476-kit2-small-parts-tokens
**Spec:** `docs/specs/ui-kit-v2/small-parts-tokens/spec.md`
**Behaviour:** changes — new optional inputs and properties; without them every component draws as today

## Task footprint

| What       | Where                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| Components | `tag/`, `toggle-switch/`, `toggle-button-group/`, `toolbar/`, `button/`, `tooltip/` |
| Handles    | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx`                  |
| Spec       | `docs/specs/ui-kit-v2/small-parts-tokens/`                                          |
| Showcase   | the stories and overview pages of the six components                                |

## What counts as done

- A rule on the tag of the tag, the toggle switch and the toggle button group overrides their size
  properties, and the size steps work as before.
- The toggle switch has its own label and a property for its disabled opacity; the tag has colour,
  padding and letter-spacing properties; the toolbar has its layout properties.
- A loading button can hide its label keeping its width; a tooltip stands on the left or right.
- Frames of stories that use no new input do not change; specs, types, lint, the overview check,
  the token checks and the snapshots are green.

## Stages

### 1. Properties

- **Steps:**
    1. The tag: size properties on the host, colour, padding and letter-spacing handles
    2. The toggle switch: size properties on the host, the label, the disabled opacity
    3. The toggle button group: size properties on the host
    4. The toolbar: layout properties
- **Readiness sign:** the specs of the four components are green, the token checks are green
- **Verified by:** `node tools/check-tokens-graph.mjs` — no new divergences

### 2. Behaviour

- **Steps:**
    1. The button hides its label while loading and keeps its width
    2. The tooltip on the left and on the right
- **Readiness sign:** the button and tooltip specs are green
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/button projects/ui-kit-v2/src/lib/components/tooltip`

### 3. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new inputs
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- Renaming `--rt-radius-*` — out of the epic.
- The dialog and toast properties — tasks RT-2479 and RT-2478.
