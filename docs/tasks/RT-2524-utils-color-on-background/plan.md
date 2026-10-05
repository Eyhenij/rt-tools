# Plan

**Task:** RT-2524 · **Branch:** RT-2524-utils-color-on-background
**Spec:** `docs/specs/utils/color-on-background/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                |
| ----- | ------------------------------------------------------------------------------------ |
| Specs | `docs/specs/utils/color-on-background/`                                              |
| Laws  | `docs/constitution/verifiability.md`, `code-structure.md`                            |
| Rules | `.claude/skills/testing/`, `.claude/skills/typescript-conventions/`                  |
| Code  | `projects/utils/src/lib/functions/`                                                  |
| Texts | `projects/ui-kit-v2/src/lib/components/tag/Overview.mdx`, `projects/utils/README.md` |

## What counts as done

- `@rt-tools/utils` exports `getColorBasedOnBackground` and `darkenHexColor`; on a six-digit
  colour with `#` they answer as the first kit does, and a short or bare colour is read right.
- The second kit's tag overview names the new home of both functions, and the first kit is
  untouched.

## Stages

### 1. Functions

- **Steps:**
    1. The spec of the subdomain, its scenarios and bindings
    2. The two functions, their specs and CONTEXT
    3. The barrel, the package README and the tag overview row
- **Readiness sign:** the utils specs pass, the package builds and the spec check knows the new
  scenarios
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/utils` — all passed; `npm run check:specs` — exit 0

## What this work does not do

- The first kit's copy is not removed or re-exported: the first kit is not touched.
- The second kit's tag gets no computed colour: its palette stays closed.
