# Plan

**Task:** RT-3292 · **Branch:** RT-3292-thread-list-error-state
**Draft:** `docs/specs/ui-kit-v2/proposed/error-states/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** a list of conversations that failed to load shows the same text as an empty list, and the
  reader cannot repeat the load; the chat and the details panel have no error view at all.
- **This task reaches:** `rt-thread-list`, `rt-chat` and `rt-workspace-details` show a load error
  with a «Повторить» button, take their own texts by inputs and their own views by templates; the
  thread list header and the tab switch stand on the spacing of the approved mockups.
- **Sign:** the showcase stories of every state of the three components match the frames
  7899:1537, 7900:2099 and 7901:2901; the owner approves the showcase.
- **Milestone G of the epic:** every component of the list holds one contract — input `error`,
  output `retry`, the empty and error slots.
- **Metric:** нет: a repair — the error of a load was shown as an empty list.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/ui-kit-v2/proposed/error-states/` (new), `docs/specs/ui-kit-v2/thread-tabs-chat-subtitle/` |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/styling-bem/` |
| Code  | `projects/ui-kit-v2/src/lib/components/empty-state/`, `projects/ui-kit-v2/src/lib/components/thread-list/`, `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`, `projects/ui-kit-v2/src/lib/components/workspace-details/`, the kit dictionary |

## What counts as done

- Each of the three components draws, in this order: the error, the skeleton, the placeholder; the
  error has a «Повторить» button that emits `retry`.
- The consumer replaces texts by inputs and the views by `rtThreadListEmpty`, `rtThreadListError`,
  `rtChatEmpty`, `rtChatError`, `rtWorkspaceDetailsError`.
- The thread list header has no side padding beyond the list padding; the tab switch stands 8 px
  from the header line and 8 px from the content.
- The showcase has a story for every state; the owner approves it; the kit is released.

## Stages

### 1. The agreement

- **Steps:**
    1. Write the feature spec of the shared contract and of the three components
    2. Write its scenarios
- **Readiness sign:** the draft holds the order of states, the inputs, the outputs, the slots and
  the spacing rule, each with a scenario id.
- **Verified by:** `npm run check:specs` — the draft is listed without errors.

### 2. The shared error view and the thread list

- **Steps:**
    1. Add the labels `uiLoadError`, `uiLoadErrorHint`, `uiRetry` and the max-width variable of `rt-empty-state`
    2. Add `error`, `retry`, the text inputs and both slots to `rt-thread-list`, with the load more error row
    3. Fix the header and the tab switch spacing of `rt-thread-list`
    4. Cover the new states by the spec
- **Readiness sign:** the thread list spec passes with the new cases; today it passes 23 tests.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-thread-list.component.spec.ts --output-style=static` — `Tests:` reports more than 23 passed and none failed.

### 3. The chat and the details panel

- **Steps:**
    1. Add `error`, `retry`, `emptyTitle`, `emptyIcon` and both slots to `rt-chat`; fix the `emptyHint` render
    2. Add `error`, `retry` and the error slot to `rt-workspace-details`
    3. Cover the new states by the specs
- **Readiness sign:** the chat and details specs pass with the new cases.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --output-style=static` — no failed suite.

### 4. The showcase

- **Steps:**
    1. Add a story for every new state of the three components
    2. Compare the stories with the frames by measurement and show them to the owner
- **Readiness sign:** every state of the agreement has a story, the measured numbers match the
  frames, the owner approves.
- **Verified by:** `pnpm run check:all` — green.

## What this work does not do

- The tables and lists (RT-3294) and the selectors, local placeholders and the PDF viewer (RT-3295).
- The first kit (`rtui-*`).
