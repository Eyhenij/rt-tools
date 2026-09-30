# Plan

**Task:** RT-2367 · **Branch:** RT-2367-visitor-talks-and-operator
**Spec:** `docs/specs/chat/spec.md`, `docs/specs/chat/widget/spec.md`
**Behaviour:** changes

## Task footprint

| What    | Where                                                                  |
| ------- | ---------------------------------------------------------------------- |
| Specs   | `docs/specs/chat/` — the chat domain and the widget subdomain          |
| Service | `libs/message-bus-api/chat/` — the storage, the procedures of the site |
| Widget  | `apps/chat-widget/src/lib/` — the list screen, the head of a talk      |
| Admin   | `apps/message-bus-admin-e2e/` — the widget specs and frames            |

## What counts as done

- The visitor sees the list of their talks on the site, with the last remark, the time, the unread
  dot and the mark of a closed talk, and starts a new talk from it.
- The visitor opens a talk from the list and goes back to the list by the arrow of the head.
- A talk with an answer names the operator in the head and in the bubbles; a talk without one shows
  the common icon and the hours.
- The spec names how the list is read, what makes a new talk and where the operator's name comes
  from; the end-to-end specs of the widget check it.

## Stages

### 1. Agreement

- **Steps:**
    1. Read the data model of the chat and the operators
    2. Write the decisions and the scenarios into the chat spec and the widget spec
- **Readiness sign:** the spec check names no divergence of the chat domain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. The service

- **Steps:**
    1. Give the visitor the list of their talks and a way to start a new one
    2. Give the site the operator's name and role at an answer
    3. Cover the procedures by the service tests
- **Readiness sign:** the chat libraries' tests and build are green
- **Verified by:** `pnpm exec nx run-many -t lint test build typecheck --projects='tag:scope:chat*'` — all targets succeed

### 3. The widget

- **Steps:**
    1. Draw the list screen and the new-talk button
    2. Draw the head of a talk with the back arrow, the avatar, the name and the role
    3. Cover the new logic by the widget tests
- **Readiness sign:** the widget targets are green
- **Verified by:** `pnpm exec nx run-many -t lint test build typecheck -p chat-widget` — all targets succeed

### 4. Frames

- **Steps:**
    1. Write the end-to-end checks of the list and of the head
    2. Compare with the mockup frames and take the frames
- **Readiness sign:** the widget end-to-end specs are green
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e -- src/chat-widget.spec.ts src/chat-widget.narrow.spec.ts` — all tests pass

### 5. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests and build are green
- **Verified by:** `pnpm run check:all` — all targets succeed

## What this work does not do

- What the visitor sees at the moment the operator closes the talk — task RT-2364.
- Status icons of delivery at the bubbles.
