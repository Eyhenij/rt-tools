# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The showcase, the texts and the gate — closed
- **Done:** all twelve steps; the agreement merged into `docs/specs/ui-kit/side-menu-favorites/`; `pnpm run check:all` green
- **Next step:** the closing — the snapshot references of the two new stories, the task folder taken apart into the archive, the PR
- **Uncommitted:** no
- **Waiting for the owner:** their look at the work and their word to send it: «я еще не смотрел, пока не скажу не пуш»
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
- [x] 3.1 A story of the side menu with favourites switched on, labels in Russian
- [x] 3.2 The favourites checked on the showcase by measurement: star, block, drag, reload
- [x] 3.3 The agreement merged into `docs/specs/ui-kit/side-menu-favorites/` with `implementation.md`, the storage article of the second level edited
- [x] 3.4 Lint, build and the spec check run whole

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
- Step 3.2, the showcase on 6006 (the owner's, raised from this tree), the story `SubMenuFavorites`:
  the block stands under the search (its top ≥ the field's bottom), rows `20, 2, 5` from two strip
  items, filled stars opacity 1, outlined 0, the outlined star of the hovered row 1 and of its
  neighbour 0; a star press added `3` to the block and to the storage; a drag by the handle gave
  `2, 5, 20, 3`, and the same order stood after a reload; document overflow 0. The showcase key
  was removed afterwards so the story shows its seed again.
- A script drag needs `detail: 1` on the events: CDK takes `detail: 0` for a screen reader's press.
- The address `iframe.html?…&globals=viewport:narrow` opened the story at 1872 px: the viewport global does not reach a bare iframe, the narrow frame was taken through an iframe of 375 px.
- Step 3.2 on the narrow screen: the story `SubMenuFavoritesMobile` in an iframe of 375 px — the narrow layout, rows `20, 2, 5` under the search, the outlined star opacity 1 without a hover, document overflow 0.
- Step 3.3: the agreement moved to `docs/specs/ui-kit/side-menu-favorites/` with `implementation.md`; the storage article of the second level names favourites as the exception; `node tools/check-specs.mjs` — only the four divergences of `main` are left.
- Step 3.4: `pnpm run check:all` — lint, typecheck, test, build, verify for 110 projects, green.

## Handover of the session

### Work

RT-2291 "В боковом меню нет избранного — нужные разделы каждый раз ищутся заново". Working tree —
`/Users/sviatoslavkhutornoy/WebstormProjects/rt-tools`, branch `RT-2291-side-menu-favorites` from
`origin/main` (in progress on the board). Work outside an epic by the owner's word «1». PR: not open
yet; the branch is not on the host.

### Where to look

The progress and the plan come by the hook. The grill is in this folder; the subdomain spec is
`docs/specs/ui-kit/side-menu-favorites/`.

### Done and the next step

Done: all steps of the plan, committed; `pnpm run check:all` green.
Next step: the closing by the pattern `task-flow-close` — take the snapshot references of the two new
stories by `pnpm run test:visual:update side-menu-favorites` after a look, take the task folder apart
into the archive, open the PR with the reviewer.

### What to keep in mind

- Sending the branch is refused by `node tools/check-specs.mjs` on four divergences that stand in
  `main` itself: `docs/specs/agent-kit/roles/scenarios.md` reuses SC-AK-1136, 1137, 1139 and 1140,
  taken by prose-guard, epic-table and edit-place (came with 5ea2c63e5). The fix already exists:
  e56a395a0 in the draft PR #2292 (`RT-2195-tree-tells-truth-about-itself`, another session's
  branch) gives them 1151–1154. It is not repeated here; after #2292 merges, main is merged into
  this branch. A trial merge of this branch with `origin/main` on 2026-09-21 had no conflicts.
- The owner has not looked at the work yet and said: «пока не скажу не пуш». Nothing is sent before
  their word.
- The showcase on 6006 is the owner's, raised from this tree; do not raise a second one.
- The menu file `rtui-side-menu.component.ts` stands at 496 lines of the 500 limit: new favourites
  logic goes into `favorites/`, not into the menu.
- The chat branch `RT-2177-chat-service` (the copy's assigned epic 2177) was left untouched; its
  task folder is still missing there.
