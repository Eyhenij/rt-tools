# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The showcase, the texts and the gate
- **Done:** stages 1–2 — the service, the stars, the block with the drag; side-menu tests 142 passed
- **Next step:** a story of the side menu with favourites
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Pure functions in `side-menu.logic.ts`: read the stored list, move by visible neighbour, find the items of the list in the menu
- [x] 1.2 `RtuiFavoritesService` and `provideRtuiFavorites()` over the `LOCAL_STORAGE` token, memory without it
- [x] 1.3 Tests of the logic and the service, SC-UK-69…SC-UK-74 and the logic part of SC-UK-87
- [x] 1.4 The service, the provider and the config type go out through the public entry of the side menu
- [x] 2.1 The star in the sub-item: filled or outlined, tooltip and accessible name, `aria-pressed`, no star on folders and on the back row
- [x] 2.2 The favourites block in the wide and the narrow submenu: heading, rows in list order, hidden under a query, absent when empty
- [x] 2.3 The drag by the handle with the CDK, the hold of a hover submenu during a drag and on a star focus
- [x] 2.4 Tests of the menu, SC-UK-75…SC-UK-92
- [>] 3.1 A story of the side menu with favourites switched on, labels in Russian
- [ ] 3.2 The favourites checked on the showcase by measurement: star, block, drag, reload
- [ ] 3.3 The agreement merged into `docs/specs/ui-kit/side-menu-favorites/` with `implementation.md`, the storage article of the second level edited
- [ ] 3.4 Lint, build and the spec check run whole

## Decisions along the way

- **The critique's fourteen findings went into the agreement before the plan** — injector level,
  storage only through core, duplicate page ids, move by visible neighbour, drag and focus hold,
  touch hover. The storage exception is the owner's own request. Affected stage of the plan: all.

- **The block is a component of its own, and the hold of the submenu a service of its own** — the
  menu file stood at 492 lines of the 500 limit; the search hold widens the panel, and a star focus
  or a drag must not. Affected stage of the plan: 2.

## Sessions

### 2026-09-21

- Grill in the owner's words; the owner chose the first kit and a task outside the epic («1»).
- Agreement and 24 scenarios, SC-UK-69…SC-UK-92; the side-menu tests: 101 passed before the work.
- Stage 1: `favorites.logic.ts`, `rtui-favorites.service.ts` and their tests; `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 6 suites, 122 passed.
- Stage 2: the star in the sub-item, `rtui-side-menu-favorites` for the block, `RtuiSubMenuHoldService` for the hold without the search widening; `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 7 suites, 142 passed; SC-UK-69…92 all in test titles, SC-UK-89 marked partial.
