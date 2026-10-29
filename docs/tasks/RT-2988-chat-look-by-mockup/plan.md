# Plan

**Task:** RT-2988 · **Branch:** RT-2988-chat-look-by-mockup
**Spec:** `docs/specs/ui-kit-v2/chat-messenger-look/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/workspace-slots/`, `docs/specs/ui-kit-v2/thread-tabs-chat-subtitle/`, `docs/specs/ui-kit-v2/message-composer/`, new `docs/specs/ui-kit-v2/chat-messenger-look/` |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/testing/`                                                                                                                              |
| Code  | `projects/ui-kit-v2/src/lib/components/workspace/`, `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`                                                                         |

## What counts as done

- `rt-workspace` with the `cards` input draws the list, the centre and the side panel as separate
  cards: a subtle border, radius 16, a gap of 16 between them, no splitter lines.
- `rt-chat` with the `messenger` input draws no author line; the own bubble is `action-primary`
  with `action-on-primary` text; the time and the delivery mark stand inside the bubble at its
  bottom right; a day label stands above the first message of every day.
- `rt-chat` with the `messenger` input has a one-line reply field with the send button inside and
  a `rtChatComposerTools` slot under the field; the attach button stands first in that row.
- Without the new inputs both components look as before.

## Stages

### 1. Cards variant of the workspace

- **Steps:**
    1. Add the `cards` input and the modifier to `rt-workspace`.
    2. Write the styles of the modifier: border, radius, gap, no splitter line.
    3. Write the scenario and the test for the modifier.
- **Readiness sign:** the workspace test passes with the new scenario.
- **Verified by:** `npx nx test ui-kit-v2 --testFile=rt-workspace.component.spec.ts` — all tests passed

### 2. Messenger bubbles

- **Steps:**
    1. Add the `messenger` input to `rt-chat` and the pure function that groups messages by day.
    2. Draw the day label, hide the author, move the time and the status inside the bubble.
    3. Write the scenarios and the tests.
- **Readiness sign:** the chat tests pass with the new scenarios.
- **Verified by:** `npx nx test ui-kit-v2 --testFile=rt-chat` — all tests passed

### 3. One-line reply field with a tools row

- **Steps:**
    1. Under `messenger` draw the plain composer with the send button inside the field.
    2. Add the `rtChatComposerTools` slot under the field and move the attach button into it.
    3. Write the scenario, the test and the showcase story; run the package checks.
- **Readiness sign:** tests, lint and build of the package are green, `npm run check:specs` has no
  remarks on the new scenarios.
- **Verified by:** `npx nx run-many -t lint test build -p ui-kit-v2` — successfully ran

## What this work does not do

- Quick replies and scheduled send: their buttons are the consumer's, the kit gives only the row.
- The message menu by long press and the edit quote above the field.
