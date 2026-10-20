# Plan

**Task:** RT-2868 · **Branch:** RT-2868-ui-kit-v2-tree-walk-module
**Behaviour:** unchanged — functions and their types move to a shared module, the old names stay as re-exports. Подтверждено владельцем: «Делай RT-2861», план эпика: «без смены поведения».

## Task footprint

| What      | Where                                                                               |
| --------- | ----------------------------------------------------------------------------------- |
| Specs     | `docs/specs/ui-kit-v2/` bindings that name the moved symbols by file                |
| Laws      | none                                                                                |
| Rules     | none                                                                                |
| Code      | `projects/ui-kit-v2/src/lib/`: `select`, `side-menu`, the six users, the new module |
| Snapshots | none change                                                                         |

## What counts as done

- The tag, the tree and the draggable tree import neither `@rt-tools/ui-kit-v2/select` nor
  `@rt-tools/ui-kit-v2/side-menu`.
- The tree walk, `rtScrollActiveOptionIntoView` and `splitTitleByWords` are declared in the shared
  module and published by `core`; the old names are re-exported with `@deprecated`.
- Tests, the build and the showcase snapshots are green without new references.

## Stages

### 1. The shared module

- **Steps:**
    1. Create the shared module under `src/lib/` with the tree walk, its types, the scroll helper and the highlight, and publish it from `core`.
    2. Turn the select and side-menu files into re-exports of the moved names, marked `@deprecated`.
    3. Move the tests of the moved functions next to the module.
- **Readiness sign:** the kit builds, and the moved tests pass in the new place.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:build` and `pnpm exec nx test @rt-tools/ui-kit-v2` — green.

### 2. The users

- **Steps:**
    1. Switch the six users to import from `core`.
    2. Point the spec bindings at the new file.
- **Readiness sign:** no user outside the owner imports the moved names from `select` or `side-menu`.
- **Verified by:** `grep -rn -E "ui-kit-v2/(select|side-menu)'" projects/ui-kit-v2/src/lib/components/{tag,tree,draggable-tree}` — no lines; `npm run check:specs` — green.

### 3. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- One search rule for the kit — RT-2869.
- The option-list controller — RT-2870.
- Removing the deprecated re-exports — after the next release.
