# Plan

**Task:** RT-2473 · **Branch:** RT-2473-kit2-icon-material-names
**Spec:** `docs/specs/ui-kit-v2/icon-material-names/spec.md`
**Behaviour:** changes — new optional inputs; without them every icon draws as today

## Task footprint

| What      | Where                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------- |
| Icon      | `projects/ui-kit-v2/src/lib/components/icon/`                                                             |
| Consumers | `button/`, `icon-button/`, `toggle-button-group/`, `split-button/`, `empty-state/`, `menu/`, `side-menu/` |
| Spec      | `docs/specs/ui-kit-v2/icon-material-names/`                                                               |
| Showcase  | the icon stories and the overview pages of the touched components                                         |

## What counts as done

- An icon given a Material name draws its kit pair, and without a pair the ligature of the font.
- `provideRtIcons('/icons', '/icons-material')` works as before.
- The second kit's specs, types, lint, the overview check and the snapshots are green; frames of
  stories that use no new input do not change.

## Stages

### 1. The icon

- **Steps:**
    1. One resolver of a Material name, with the menu item and the side menu moved onto it
    2. The glyph, the font ligature and the strategy option on rt-icon
    3. The spin and the size in pixels on rt-icon
- **Readiness sign:** the icon specs are green, the menu and side menu specs unchanged and green
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/icon`

### 2. The components that draw icons

- **Steps:**
    1. The glyph on rtButton, with the material drawing under the material preset
    2. The glyph on rt-icon-button, the toggle button group, the split button and the empty state
- **Readiness sign:** the specs of these components are green
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components`

### 3. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the icon stories for the glyph, the spin and the size
    3. Snapshots retaken for the new stories only
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- The empty button of the side menu without a pair — task RT-2482.
- The icon of a toast — task RT-2478.
- Shipping the Material Symbols font: the application connects it itself.
