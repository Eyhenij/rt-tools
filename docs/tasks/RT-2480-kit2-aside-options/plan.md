# Plan

**Task:** RT-2480 · **Branch:** RT-2480-kit2-aside-options
**Spec:** `docs/specs/ui-kit-v2/aside-options/spec.md`
**Behaviour:** changes — new config options, a stream, inputs, a slot and properties; without them the panel and the dialog behave and draw as today, except that a disposed overlay now finishes `afterClosed()`

## Task footprint

| What       | Where                                                              |
| ---------- | ------------------------------------------------------------------ |
| Components | `aside/`, `dialog/rt-dialog-ref.ts`                                |
| Handles    | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx` |
| Spec       | `docs/specs/ui-kit-v2/aside-options/`                              |
| Showcase   | the panel stories and its overview pages                           |

## What counts as done

- A panel or dialog disposed without `close()` finishes `afterClosed()` with `undefined`.
- The panel opened with an owner's injector takes its providers and closes when the owner is destroyed.
- `closeRequests()` reports the closing gestures the panel refused.
- `rt-aside` traps focus on request and shows a pending layer on request.
- The header takes a full-width row under its title.
- The panel's padding, footer layout, title line height and error margin read properties.
- Frames of stories that use nothing new do not change; specs, types, lint, the overview check,
  the token checks and the snapshots are green.

## Stages

### 1. Behaviour

- **Steps:**
    1. Closing by overlay disposal in both handles
    2. The owner's injector and the close requests
    3. The focus trap and the pending layer of the panel
    4. The header content slot
- **Readiness sign:** the panel and dialog specs are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=aside` — all pass

### 2. Styles

- **Steps:**
    1. The panel's padding, footer, title and error properties
- **Readiness sign:** the token checks are green
- **Verified by:** `node tools/check-tokens-graph.mjs` — no new divergences

### 3. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new inputs, slot and properties
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- An owner's injector for the dialog — the request names only the panel.
- The tabs layout keeps `--rt-aside-inset` for its edge-to-edge strip; the new content property
  pads the ordinary layout.
- Moving the pending layer onto the spinner's own backdrop — that waits for the spinner change.
