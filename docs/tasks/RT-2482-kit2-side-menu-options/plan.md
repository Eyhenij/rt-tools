# Plan

**Task:** RT-2482 · **Branch:** RT-2482-kit2-side-menu-options
**Spec:** `docs/specs/ui-kit-v2/side-menu-options/spec.md`
**Behaviour:** changes — new inputs, a template fallback and an icon button slot; without them the side menu and the icon button behave and draw as today

## Task footprint

| What       | Where                                              |
| ---------- | -------------------------------------------------- |
| Components | `side-menu/`, `icon-button/`                       |
| Spec       | `docs/specs/ui-kit-v2/side-menu-options/`          |
| Showcase   | the side menu and icon button stories and overview |

## What counts as done

- The side menu hides the pin button on request and then reads no stored pinned mode.
- The side menu hides the submenu row tooltips on request.
- A row button without a kit icon takes the menu's own template; the template knows its place.
- `rt-icon-button` projects its content when it has no icon name.
- Frames of stories that use nothing new do not change; specs, types, lint, the overview check and
  the snapshots are green.

## Stages

### 1. Behaviour

- **Steps:**
    1. The pin button and the submenu tooltips switches
    2. The icon button content slot
    3. The row button fallback to the menu template
- **Readiness sign:** the side menu and icon button specs are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=side-menu` — all pass

### 2. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new switches and the fallback
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- Drawing an unpaired name by the Material font — that is the glyph strategy of task RT-2473.
