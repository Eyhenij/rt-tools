# Plan

**Task:** RT-2293 · **Branch:** RT-2293-chat-talks-on-kit-list
**Spec:** `docs/specs/chat/operator-panel/spec.md`

## Task footprint

| What  | Where                                                                           |
| ----- | ------------------------------------------------------------------------------- |
| Specs | `docs/specs/chat/operator-panel/`                                               |
| Code  | `libs/message-bus-admin/chat/feature/panel/`, `libs/message-bus-admin/chat/ui/` |
| Style | `apps/message-bus-admin/src/styles/_chat.scss`                                  |
| Tests | `apps/message-bus-admin-e2e/src/chat-section.spec.ts`                           |

## What counts as done

- The list of talks is drawn by `rt-thread-list`, and the panel keeps no list markup of its own.
- The row of the list is a view without a control of its own: the selection is the kit's business.
- The narrowings by site and by state stand in the slots of the kit.
- The uniformity check names no divergence, and the end-to-end cases of the section pass.

## Stages

### 1. The list is the ready-made of the kit

- **Steps:**
    1. Draw the list by `rt-thread-list`: rows, the chosen row, the empty text and the reading.
    2. Put the narrowing by site and by state into the slots of the kit.
- **Readiness sign:** the panel template holds no loop over the rows of its own.
- **Verified by:** `node tools/check-reuse.mjs` — it names no divergence of the chat.

### 2. The row is a view without a control

- **Steps:**
    1. Take the control out of the row: the kit draws it itself.
    2. Bring the styles of the section to the markup of the kit.
- **Readiness sign:** the row component carries neither the chosen input nor the choose output.
- **Verified by:** `pnpm exec nx build message-bus-admin` — the build passes.

### 3. The end-to-end cases follow the new markup

- **Steps:**
    1. Bring the labels of the section to the markup of the kit.
    2. Run the end-to-end cases of the chat section.
- **Readiness sign:** the cases of the section are green on the stand.
- **Verified by:** `pnpm exec nx e2e message-bus-admin-e2e --grep chat` — the cases pass.

## What this work does not do

- The search over the text of the talks: an open question of the domain spec, and the slot of the
  search is taken by the narrowing by site.
