# Plan

**Task:** RT-2720 · **Branch:** RT-2720-ai-chat-copy
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                                          |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md` |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`             |

## What counts as done

- A finished answer with text shows «Copy» first in its action row; the press puts `message.text` into the clipboard.
- A question shows «Copy» in a row under its bubble at the end side.
- After a press the icon is `check` and the name «Copied» for two seconds.
- `copyable` turns both off.

## Stages

### 1. The copy buttons

- **Steps:**
    1. `rt-ai-chat-copy` and the answer row
    2. The question row and `copyable` with the spec cases
    3. The showcase frames re-taken
    4. Overview, CONTEXT and the assistant chat spec with scenarios SC-UKV-777 and SC-UKV-778
- **Readiness sign:** the organism spec passes, the build of the kit is green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — every suite passes

## What this work does not do

- The merge and the publish of the kit.
