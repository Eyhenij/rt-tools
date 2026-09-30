# Plan

**Task:** RT-2434 · **Branch:** RT-2434-kit2-upload-story-like-kit1
**Behaviour:** unchanged — the owner asked for the showcase story only, the uploader itself stays as it is

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/image-upload/`                          |
| Rules | `.claude/skills/rt-tools-storybook/`                          |
| Code  | `projects/ui-kit-v2/src/lib/components/image-upload/stories/` |

## What counts as done

- `Playground` of the uploader shows the uploader with the current picture and the corner button,
  with no demo buttons, caption or summary.
- `Cropping` and `Applied` reach the cropper and the applied picture by a file put into the
  uploader's field.
- The uploader frames match: the visual gate of the second kit is green.

## Stages

### 1. The story like the first kit's

- **Steps:**
    1. Take the story commit made in the branch of the merged PR #2410
    2. Retake the uploader frames and run the visual gate
- **Readiness sign:** the uploader stories pass and their frames match
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 'image-upload'` — «Tests: 6 passed»

## What this work does not do

- The look of the corner button and of the cropper width against the first kit — a separate
  finding if the owner names it.
