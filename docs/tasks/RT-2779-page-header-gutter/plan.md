# Plan

**Task:** RT-2779 · **Branch:** RT-2779-page-header-gutter
**Spec:** `docs/specs/ui-kit-v2/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/spec.md`                                                                                                                                                     |
| Laws  | `docs/constitution/reuse-first.md`                                                                                                                                                 |
| Rules | `.claude/skills/rt-tools-styling/`, `.claude/skills/styling-bem/`                                                                                                                  |
| Code  | `projects/ui-kit-v2/src/lib/components/container/`, `projects/ui-kit-v2/src/lib/components/page-header/CONTEXT.md`, `projects/ui-kit-v2/src/showcase/templates/styles/_shell.scss` |

## What counts as done

- A page header projected straight into the container's header zone stands 20px from the top, left
  and right edges, with no style of the application's own.
- A page header inside an application's own bar, and any other header content, gets no margin.
- The `templates-list-page--*` frames match their references unchanged.

## Stages

### 1. The container gives the margin

- **Steps:**
    1. Add the margin rule for a page header in the header zone to the container styles
    2. Drop the margin rule from the showcase shell layer
    3. Rewrite the margin lines in the container and page header descriptions
    4. Add the line to the kit spec
- **Readiness sign:** the styles linter and the token check are clean, and the container tests pass.
- **Verified by:** `pnpm run lint:styles` — no findings; `pnpm run check:tokens-styles` — no new
  findings; `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/container` — all
  green.

### 2. The showcase frames

- **Steps:**
    1. Match the showcase frames against their references
- **Readiness sign:** no frame differs from its reference.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every frame matches.

## What this work does not do

- The showcase profile menu stays in the showcase. Moving it into the package is a component of its
  own and is offered to the owner as a separate task.
- The narrow-screen margin is not changed: the showcase used one value on every width, and the
  package keeps it.
