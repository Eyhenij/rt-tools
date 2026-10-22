# Plan

**Task:** RT-2934 · **Branch:** RT-2934-service-block
**Spec:** `docs/specs/ui-kit-v2/service-block/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                                                                                                                                                     |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                                       |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/lib/components/service-block/`, `projects/ui-kit-v2/service-block/`                                                                                 |

## What counts as done

- `rt-service-block` draws the mark of `rt-service-logo` at the size `md`, the name and the
  description, with the numbers of the component «Service Block» and a line under the block.
- The marks are given by the same items as `rt-service-logo` takes; the block carries no text of
  its own; on a narrow place the description wraps.
- The part is exported by its own entry and by the package entry.
- The unit spec, the lint, the package build and the styles linter are green; the stories and the
  overview page lie next to the part.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the subdomain spec `docs/specs/ui-kit-v2/service-block/` with numbered scenarios.
- **Readiness sign:** the spec lies on disk and is named in the domain indexes.
- **Verified by:** `node tools/check-specs.mjs` — the scenarios of the subdomain are counted.

### 2. Component

- **Steps:**
    1. Write the component, its template, its styles and its entry.
    2. Write the unit spec, the stories, the overview page and the context file.
- **Readiness sign:** the spec, the lint, the package build and the styles linter are green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-service-block.component.spec.ts` — the spec of the part runs and passes.

### 3. Closing

- **Steps:**
    1. Take the snapshot references of the new stories after a look at the frames.
    2. Take the folder apart into the archive.
- **Readiness sign:** the references lie next to the showcase and no task folder lies in the branch.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every frame matches its reference.

## What this work does not do

- The panels of the application that put the block in place: they are edited in the consumer.
- The publication of a new version of the package: a manual start of its workflow.
