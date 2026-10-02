# Plan

**Task:** RT-2477 · **Branch:** RT-2477-kit2-scroll-area-action-bar
**Spec:** `docs/specs/ui-kit-v2/scroll-area-action-bar-tokens/spec.md`
**Behaviour:** changes — new properties; without them the scroll area and the bar draw as today, the action bar menu gets back its rounding and shadow

## Task footprint

| What       | Where                                                              |
| ---------- | ------------------------------------------------------------------ |
| Components | `scroll-area/`, `action-bar/`                                      |
| Handles    | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx` |
| Spec       | `docs/specs/ui-kit-v2/scroll-area-action-bar-tokens/`              |
| Showcase   | the stories and overview pages of the two components               |

## What counts as done

- The scroll area reads the paddings and backgrounds of its header, body and footer from properties.
- The action bar reads its colours, paddings, gaps, font size and weights from properties.
- The menu of the bar opens with its rounding and shadow, and its colours come from properties.
- Frames of stories that use no new property do not change; specs, types, lint, the overview check,
  the token checks and the snapshots are green.

## Stages

### 1. Properties

- **Steps:**
    1. The scroll area: padding and background properties
    2. The action bar: colour, padding, gap, font and weight properties
    3. The action bar menu: properties read with a fallback in the overlay
- **Readiness sign:** the specs of both components are green, the token checks are green
- **Verified by:** `node tools/check-tokens-graph.mjs` — no new divergences

### 2. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new properties and the open menu
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- The holder of the action bar and its placement — no item of the request names them.
- The scroll hint's colour — it already has its own property.
