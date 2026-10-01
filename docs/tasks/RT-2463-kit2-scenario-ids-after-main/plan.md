# Plan

**Task:** RT-2463 · **Branch:** RT-2463-kit2-scenario-ids-after-main
**Behaviour:** unchanged — only scenario numbers and test titles move; the owner: «делай что нужно»

## Task footprint

| What  | Where                                                                                                                                                                                        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/image-cropper/`, `docs/specs/ui-kit-v2/image-upload/`, `docs/specs/ui-kit-v2/expansion-panel/`, `docs/specs/ui-kit-v2/side-menu/`, `docs/specs/ui-kit-v2/scenarios.md` |
| Tests | the spec files of the same four components in `projects/ui-kit-v2/src/lib/components/`                                                                                                       |

## What counts as done

- `npm run check:specs` names no divergence.
- The second kit's specs are green.

## Stages

### 1. Renumbering

- **Steps:**
    1. Move the 43 colliding identifiers of the four epic subdomains to 491–533 in specs, bindings, the index and test titles
    2. Run the spec check and the second kit's specs
- **Readiness sign:** the spec check names no divergence, the specs are green
- **Verified by:** `npm run check:specs` — exits 0

## What this work does not do

- The dynamic selector remarks — task RT-2455, next in the chain.
