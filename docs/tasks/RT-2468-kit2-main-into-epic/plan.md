# Plan

**Task:** RT-2468 · **Branch:** RT-2468-kit2-main-into-epic
**Behaviour:** unchanged — main is merged in and two overview tables gain rows; the owner: «мейн подтяни»

## Task footprint

| What      | Where                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Overviews | `projects/ui-kit-v2/src/lib/components/dynamic-selector/Overview.mdx`, `projects/ui-kit-v2/src/lib/components/expansion-panel/Overview.mdx` |
| Specs     | `docs/specs/ui-kit-v2/scenarios.md`                                                                                                         |

## What counts as done

- `node tools/verify-ui-kit-v2-docs.cjs` exits 0.
- `npm run check:specs` names no divergence, and the second kit's specs are green.

## Stages

### 1. Main in the epic

- **Steps:**
    1. Describe the inputs chosenEntities and expanded in the two overview tables
    2. Run the overview check, the spec check and the second kit's specs
- **Readiness sign:** all three are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- The PR of the epic into main — the owner: «пр эпика в мейн пока не открывай».
