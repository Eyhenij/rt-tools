# Plan

**Task:** RT-2365 · **Branch:** RT-2365-widget-look-by-mockup
**Spec:** `docs/specs/chat/widget/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                     |
| ----- | ------------------------------------------------------------------------- |
| Specs | `docs/specs/chat/widget/`                                                 |
| Code  | `apps/chat-widget/src/lib/` — the styles, the markup, the words           |
| Admin | `apps/message-bus-admin-e2e/` — the frames `widget-page`, `widget-narrow` |

## What counts as done

- The folded widget is a round button with an icon.
- The open panel is 380 px wide with a blue head carrying the title, the hours and a cross.
- The messages are bubbles, and the field and the send button look like the rest of the interface;
  the field draws the ring of the kit's fields in focus.
- On a narrow screen the widget takes the whole screen as the phone frames of the mockup show.
- The spec and the end-to-end frames describe the new look.

## Stages

### 1. Agreement

- **Steps:**
    1. Read the frames of the mockup for the wide screen and the phone
    2. Write the look rules and the scenarios into the widget spec
- **Readiness sign:** the spec check names no divergence of the widget subdomain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. The look

- **Steps:**
    1. Redraw the bubble, the head, the thread and the field in the widget styles and markup
    2. Draw the focus ring of the field
    3. Cover the new markup by the widget tests
- **Readiness sign:** the widget tests and its build are green
- **Verified by:** `pnpm exec nx run-many -t lint test build -p chat-widget` — all targets succeed

### 3. Frames

- **Steps:**
    1. Compare the widget with the mockup frames in the browser by measurement
    2. Re-take the frames `widget-page` and `widget-narrow`
- **Readiness sign:** the widget end-to-end specs are green
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e -- src/chat-widget.spec.ts src/chat-widget.narrow.spec.ts` — all tests pass

### 4. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests and build are green
- **Verified by:** `pnpm run check:all` — all targets succeed

## What this work does not do

- The list of the visitor's talks and the operator's name — task RT-2367.
- What the visitor sees after the talk is closed — task RT-2364.
