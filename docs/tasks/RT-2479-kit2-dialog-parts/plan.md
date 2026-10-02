# Plan

**Task:** RT-2479 · **Branch:** RT-2479-kit2-dialog-parts
**Spec:** `docs/specs/ui-kit-v2/dialog-parts/spec.md`
**Behaviour:** changes — new config options, a slot, an input, a part and properties; without them the dialog behaves and draws as today

## Task footprint

| What       | Where                                                              |
| ---------- | ------------------------------------------------------------------ |
| Components | `dialog/`                                                          |
| Handles    | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx` |
| Spec       | `docs/specs/ui-kit-v2/dialog-parts/`                               |
| Showcase   | the dialog stories and its overview pages                          |

## What counts as done

- The dialog config can trap focus, restore it and move it on opening; all three are off by default.
- The header takes a lead element before its title.
- The footer aligns its content to the start, the centre, the end or both edges.
- A content part pads and scrolls the dialog body, with its own padding and height cap.
- The dialog's background, border, header, title and footer read their look from properties.
- Frames of stories that use nothing new do not change; specs, types, lint, the overview check,
  the token checks and the snapshots are green.

## Stages

### 1. Behaviour

- **Steps:**
    1. Focus options in the dialog config
    2. The header lead slot and the footer alignment
    3. The content part
- **Readiness sign:** the dialog specs are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=dialog` — all pass

### 2. Styles

- **Steps:**
    1. The dialog, header, title and footer properties
- **Readiness sign:** the token checks are green
- **Verified by:** `node tools/check-tokens-graph.mjs` — no new divergences

### 3. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new slot, alignment, part and properties
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- Focus handling of the side panel — that is task RT-2480.
- The inline dialog form mentioned in the service comment — the request names only the service.
