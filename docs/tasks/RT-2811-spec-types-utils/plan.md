# Plan

**Task:** RT-2811 · **Branch:** RT-2811-spec-types-utils
**Behaviour:** unchanged — only two specs and a project file change; the functions behave as before.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                              |
| ----- | ------------------------------------------------------------------ |
| Rules | `.claude/skills/testing/`                                          |
| Code  | `projects/utils/src/lib/functions/`, `projects/utils/project.json` |

## What counts as done

- `pnpm exec tsc -p projects/utils/tsconfig.spec.json --noEmit --rootDir .` ends with no error.
- The package has a `typecheck` target, and its specs pass with the same coverage threshold.

## Stages

### 1. Utils spec types

- **Steps:**
    1. Replace the BigInt literal in the `isNumber` spec
    2. Type the comparator of the `safeCompare` spec for numbers, null and undefined
    3. Add the `typecheck` target to the package
    4. Run the specs of the package and the tree set

- **Readiness sign:** the type check of the spec project is empty and the specs pass.
- **Verified by:** `pnpm exec tsc -p projects/utils/tsconfig.spec.json --noEmit --rootDir .` — no output.

## What this work does not do

- A spec type check for packages that already have none and no errors — a decision of its own.
