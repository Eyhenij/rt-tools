# Plan

**Task:** RT-2729 · **Branch:** RT-2729-ai-chat-thread-menu
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                        |
| ----- | ------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                              |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/` |
| Code  | `projects/ui-kit-v2/src/lib/components/thread-list/`         |
| Code  | `projects/ui-kit-v2/src/lib/i18n/`                           |

## What counts as done

- `threadMenu` off: the delete button as before, no menu button.
- `threadMenu` on: the «More actions» button opens «Copy ID» and «Delete»; Copy ID copies the id; Delete emits `deleteThread` without `selectThread` and without confirmation.

## Stages

### 1. Component and unit tests

- **Steps:**
    1. Label `aiCopyThreadId` in the English set and the showcase Russian set
    2. Input `threadMenu` and the menu in the row actions of `rt-ai-chat`
    3. Row actions stay visible while their menu is open
    4. Unit tests of the menu
- **Readiness sign:** the ai-chat spec is green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-ai-chat.component.spec.ts` — «Tests» line without failed

### 2. Documents and delivery

- **Steps:**
    1. Spec, scenarios, implementation, CONTEXT, Overview, stories
    2. Dist build
    3. Push gate and push
- **Readiness sign:** the gate passes and the branch is on the remote
- **Verified by:** `pnpm run build:ui-kit-v2` — exit 0

## What this work does not do

- No PR, no publish: the owner asked for the branch only.
