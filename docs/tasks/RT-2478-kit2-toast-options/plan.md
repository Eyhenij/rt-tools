# Plan

**Task:** RT-2478 · **Branch:** RT-2478-kit2-toast-options
**Spec:** `docs/specs/ui-kit-v2/toast-options/spec.md`
**Behaviour:** changes — new options, properties and a mode; without them the toaster and its toasts behave and draw as today

## Task footprint

| What       | Where                                                              |
| ---------- | ------------------------------------------------------------------ |
| Components | `toast/`, `platform/notification.model.ts`                         |
| Handles    | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx` |
| Spec       | `docs/specs/ui-kit-v2/toast-options/`                              |
| Showcase   | the toast stories and its overview page                            |

## What counts as done

- The toaster's layer comes from its own property on the kit scale.
- A toast lives its own duration, and `null` keeps it until the close button.
- A toast with `progress` draws a strip of its time that pauses with the timer.
- The toast and its filled kinds read their colours from handles.
- The toaster in `replace` mode lets the previous toasts leave when a new one arrives.
- A toast takes its own icon, `null` hides it, and the severity map is injectable.
- Frames of stories that use nothing new do not change; specs, types, lint, the overview check,
  the token checks and the snapshots are green.

## Stages

### 1. Behaviour

- **Steps:**
    1. Duration and progress in the options, the model and the toast timer
    2. The replace mode of the toaster
    3. The per-toast icon and the severity icons token
- **Readiness sign:** the toast and toaster specs are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=toast` — all pass

### 2. Styles

- **Steps:**
    1. The toaster layer property
    2. The progress strip and the colour handles of the toast and its filled kinds
- **Readiness sign:** the token checks are green
- **Verified by:** `node tools/check-tokens-graph.mjs` — no new divergences

### 3. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new options, mode and handles
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- The toaster's width and offset — no item of the request names them.
- A label colour for the main action — the request names only its colour.
