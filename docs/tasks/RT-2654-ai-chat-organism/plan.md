# Plan

**Task:** RT-2654 · **Branch:** RT-2654-ai-chat-organism
**Spec:** `docs/specs/ui-kit-v2/ai-chat/`
**Behaviour:** changes — a new component, and a new template of the thread list

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                                            |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`               |
| Code  | `projects/ui-kit-v2/src/lib/components/thread-list/` — row actions         |
| Code  | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts` — the panel's labels |

## What counts as done

- `rt-ai-chat` draws the twelve states of the mockups and is connected as one component from
  `@rt-tools/ui-kit-v2/rich-editor`.

## Stages

### 1. The organism

- **Steps:**
    1. Write the row actions of the thread list
    2. Write the labels, the model, the component and the answer
    3. Write the spec and the scenarios, the unit spec, the stories, CONTEXT.md and Overview.mdx
    4. Shoot the frames and look at them
- **Readiness sign:** the unit spec and the kit checks pass, the frames match the mockups
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 && node tools/visual-gate.mjs ui-kit-v2` — successful run

## What this work does not do

- The release of the version — task RT-2655.
