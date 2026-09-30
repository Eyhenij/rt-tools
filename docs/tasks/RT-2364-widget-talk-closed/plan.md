# Plan

**Task:** RT-2364 · **Branch:** RT-2364-widget-talk-closed
**Spec:** `docs/specs/chat/widget/spec.md`
**Behaviour:** changes

## Task footprint

| What    | Where                                                                      |
| ------- | -------------------------------------------------------------------------- |
| Specs   | `docs/specs/chat/` — the widget subdomain, the data of the chat domain     |
| Service | `libs/message-bus-api/chat/` — the minute of the closing, the stream event |
| Widget  | `apps/chat-widget/src/lib/` — the closed talk, the next remark             |
| Admin   | `apps/message-bus-admin-e2e/` — the widget spec, the seed, the frame       |

## What counts as done

- The open widget learns of the closing without a reload and shows the line «Разговор завершён» with
  its time under the thread; the field says «Новый вопрос? Напишите нам».
- The next remark of the visitor starts a new talk, and the closed one stays closed in the list.
- The widget spec names the state of a closed talk and where the next remark goes; the end-to-end
  specs of the widget check it.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the rules, the state and the scenarios into the widget spec and the chat data
- **Readiness sign:** the spec check names no divergence of the chat domain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. The service

- **Steps:**
    1. Keep the minute of the closing and send the closing into the stream of the visitor
    2. Cover it by the service tests
- **Readiness sign:** the receiver projects are green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p 'message-bus*'` — all targets succeed

### 3. The widget

- **Steps:**
    1. Draw the closed talk and send the next remark into a new talk
    2. Write the end-to-end checks and take the frame of the closed talk
- **Readiness sign:** the widget end-to-end specs are green
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e -- src/chat-widget.spec.ts src/chat-widget.narrow.spec.ts` — all tests pass

### 4. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests and build are green
- **Verified by:** `pnpm run check:all` — all targets succeed

## What this work does not do

- A closing by the visitor: the visitor does not close talks.
