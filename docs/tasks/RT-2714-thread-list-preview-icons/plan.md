# Plan

**Task:** RT-2714 · **Branch:** RT-2714-thread-list-preview-icons
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                                                                                    |
| Laws  | `docs/constitution/verifiability.md`                                                                               |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/component-structure/`                                        |
| Code  | `projects/ui-kit-v2/src/lib/components/thread-list/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/` |

## What counts as done

- `rt-thread-list` takes `emptyPreviewIcons`, default `user`, `users`, `user`; every second row is shifted.
- `rt-ai-chat` takes `emptyPreviewIcons`, default `sparkle`, `bot`, `sparkle`, and passes it to its list of conversations.
- The specs of both components pass, the kit builds.

## Stages

### 1. The inputs and their specs

- **Steps:**
    1. `emptyPreviewIcons` of `rt-thread-list` with the spec cases
    2. `emptyPreviewIcons` of `rt-ai-chat` with the spec case
    3. Overview, CONTEXT and the assistant chat spec with scenarios SC-UKV-775 and SC-UKV-776
- **Readiness sign:** both specs pass, the build of the kit is green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — every suite passes

## What this work does not do

- The texts and the layout of the empty state; the merge and the publish of the kit.
