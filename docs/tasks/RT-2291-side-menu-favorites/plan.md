# Plan

**Task:** RT-2291 · **Branch:** RT-2291-side-menu-favorites
**Draft:** `docs/specs/ui-kit/proposed/side-menu-favorites/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit/proposed/side-menu-favorites/` (new subdomain), `docs/specs/ui-kit/side-menu/` (the storage article gets the favourites exception)                                                                                            |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/navigation.md`                                                                                                                               |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/angular-patterns/`, `.claude/skills/platform-access/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/testing/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit/src/lib/ui-kit/side-menu/` — the service, the logic, the menu, the sub-item, the stories                                                                                                                                        |

## What counts as done

- An application that calls `provideRtuiFavorites()` gets stars on the submenu items and the
  favourites block at the top of every submenu; one that does not sees the menu as before.
- The list is kept in the storage, survives a new service over the same key, is reordered by a drag
  of the handle and read and written by the application through `RtuiFavoritesService`.
- Every scenario SC-UK-69…SC-UK-92 stands in a test title, and the side-menu tests are green.
- The showcase has a story with favourites; the agreement is merged into the domain spec.

## Stages

### 1. The service and its logic

- **Steps:**
    1. Pure functions in `side-menu.logic.ts`: read the stored list, move by visible neighbour, find the items of the list in the menu
    2. `RtuiFavoritesService` and `provideRtuiFavorites()` over the `LOCAL_STORAGE` token, memory without it
    3. Tests of the logic and the service, SC-UK-69…SC-UK-74 and the logic part of SC-UK-87
    4. The service, the provider and the config type go out through the public entry of the side menu
- **Readiness sign:** the new tests pass together with the old 101.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — "Tests:" shows all passed and more than 101.

### 2. The stars and the block in the menu

- **Steps:**
    1. The star in the sub-item: filled or outlined, tooltip and accessible name, `aria-pressed`, no star on folders and on the back row
    2. The favourites block in the wide and the narrow submenu: heading, rows in list order, hidden under a query, absent when empty
    3. The drag by the handle with the CDK, the hold of a hover submenu during a drag and on a star focus
    4. Tests of the menu, SC-UK-75…SC-UK-92
- **Readiness sign:** all scenarios of the agreement stand in test titles, and the side-menu tests are green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — "Tests:" shows all passed.

### 3. The showcase, the texts and the gate

- **Steps:**
    1. A story of the side menu with favourites switched on, labels in Russian
    2. The favourites checked on the showcase by measurement: star, block, drag, reload
    3. The agreement merged into `docs/specs/ui-kit/side-menu-favorites/` with `implementation.md`, the storage article of the second level edited
    4. Lint, build and the spec check run whole
- **Readiness sign:** the build, the lint and the spec check are green, the story shows the block.
- **Verified by:** `pnpm run check:all` — ends without a failed target.

## What this work does not do

- Favourites of `rt-page-header` of the second kit.
- The keyboard walk over the block and a reorder from the keyboard.
- Synchronising the list between tabs.
- The admin application.
