# Plan

**Task:** RT-2299 · **Branch:** RT-2299-kit-thread-list-string-id
**Spec:** `docs/specs/ui-kit-v2/`

## Task footprint

| What  | Where                                                                                |
| ----- | ------------------------------------------------------------------------------------ |
| Code  | `projects/ui-kit-v2/src/lib/components/thread-list/`                                 |
| Docs  | `projects/ui-kit-v2/src/lib/components/thread-list/CONTEXT.md`                       |
| Tests | `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts` |

## What counts as done

- A row of the list carries an identifier of a string or of a number, and both kinds go through
  the chosen row and the selection outward.
- A consumer that passes numbers keeps working without an edit of its own.
- The spec of the component is green, and the build of the kit passes.

## Stages

### 1. The identifier of a row takes both kinds

- **Steps:**
    1. Widen the identifier of the row, of the chosen row and of the two outputs.
    2. Bring the description of the component to what it now takes.
- **Readiness sign:** a list of rows with string identifiers is assembled without a cast.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.spec.ts` — the run is green.

### 2. The case of a string identifier

- **Steps:**
    1. Write the case: a row with a string identifier is chosen and given outward.
    2. Run the spec of the component whole.
- **Readiness sign:** the case is in the spec and it is green.
- **Verified by:** `pnpm exec nx build @rt-tools/ui-kit-v2` — the build passes.

## What this work does not do

- The panel of the operator: it takes the widened list by task RT-2293.
