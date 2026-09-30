# Plan

**Task:** RT-2436 · **Branch:** RT-2436-kit2-upload-download-button
**Spec:** `docs/specs/ui-kit-v2/image-upload/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                 |
| ----- | ----------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/image-upload/`                  |
| Rules | `.claude/skills/rt-tools-storybook/`                  |
| Code  | `projects/ui-kit-v2/src/lib/components/image-upload/` |

## What counts as done

- The download button reaches past the picture's top right corner, as in the first kit.
- The input `downloadShape` gives a round or a square button; round by default.
- The spec, the scenario `SC-UKV-489`, its test, the overview and the showcase say the same.

## Stages

### 1. The button like the first kit's

- **Steps:**
    1. Write the rule and the scenario into the spec
    2. Add the input and the place of the button to the component
    3. Cover the scenario by a test
    4. Show both forms in the showcase and the overview
- **Readiness sign:** the uploader's tests and frames pass, the spec check is green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=image-upload` — «Tests:» with no failed

## What this work does not do

- The look of the first kit is not edited.
