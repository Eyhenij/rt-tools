# Plan

**Task:** RT-2522 · **Branch:** RT-2522-kit2-image-upload-options
**Spec:** `docs/specs/ui-kit-v2/image-upload-options/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/image-upload-options/`                             |
| Laws  | `docs/constitution/frontend-application.md`, `verifiability.md`          |
| Rules | `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/image-upload/`                    |

## What counts as done

- The uploader takes the download button size and blur from its properties, the icon size, the
  choose look and icon from inputs, and has no gap under the preview.
- Without the new values every frame of the kit matches, except the uploader frames with a
  picture, re-taken by the gap fix and looked over.

## Stages

### 1. Behaviour

- **Steps:**
    1. The spec of the subdomain, its scenarios and bindings
    2. The download properties and the icon size input
    3. The choose button inputs and the preview without the gap
- **Readiness sign:** the uploader specs pass and the spec check knows the new scenarios
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=image-upload` — all passed; `npm run check:specs` — exit 0

### 2. Showcase

- **Steps:**
    1. The overview tables and the story for the new values
    2. Snapshots for the new story and the re-taken uploader frames
- **Readiness sign:** the full snapshot audit and the story sweep pass
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every snapshot passed; `pnpm run test:stories:v2` — no empty showings

## What this work does not do

- The icon button itself is not touched: the icon size input passes its steps as they are.
