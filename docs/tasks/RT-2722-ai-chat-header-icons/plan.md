# Plan

**Task:** RT-2722 · **Branch:** RT-2722-ai-chat-header-icons
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`, `docs/specs/ui-kit-v2/icon-material-names/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`, `docs/specs/ui-kit-v2/icon-material-names/`                                                                                 |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                                                                     |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/`                                                                                   |
| Code  | `projects/ui-kit-v2/src/lib/components/icon/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`, `projects/ui-kit-v2/src/assets/icons-material/` |

## What counts as done

- An icon inside `data-rt-icon-preset='material'` draws the material drawing, with no token of the material preset.
- `headerIconPreset="material"` puts the sign on the chat header; by default the header has no sign.
- `history` and `window-minimize` have material drawings, and `check-icon-map` is green.

## Stages

### 1. The icon sign and the header input

- **Steps:**
    1. The sign `data-rt-icon-preset` and its constant
    2. The material drawings of `history` and `window-minimize`
    3. `headerIconPreset` on `rt-ai-chat` with the spec cases
    4. The specs, scenarios SC-UKV-779 and SC-UKV-780, CONTEXT and Overview
- **Readiness sign:** the icon and organism specs pass, the icon map check is green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — every suite passes

## What this work does not do

- The PR, the merge and the publish of the kit.
