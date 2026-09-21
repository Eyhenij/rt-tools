# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The showcase, the texts and the gate — closed
- **Done:** all twelve steps; the agreement merged into `docs/specs/ui-kit/side-menu-favorites/`; `pnpm run check:all` green
- **Next step:** the closing — the snapshot references of the two new stories, the task folder taken apart into the archive, the PR
- **Uncommitted:** no — the owner's remarks are committed locally, nothing pushed
- **Waiting for the owner:** a second look after their five remarks, and their word to send it: «я еще не смотрел, пока не скажу не пуш»
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

- **The owner's five remarks after the showcase went in without a new plan** — English labels in
  the story; a remove button in the block rows; `star_border` and `star` in the theme colour with
  `--rt-side-menu-favorite-color` for the application; the `favorites` flag per strip item, off by
  default; the handle of the dynamic selector. The executor's reading: the block of a section shows
  only that section's favourites, the list in storage stays one. Affected stage of the plan: 2, 3.

- **The review by three independent roles was taken whole, not by choice** — code, tests and the
  agreement read by `general-purpose`, `qa-engineer` and `spec-critic`. Confirmed and fixed: the
  section is taken from the submenu the panel shows (`shownSubMenu`) and by ids too; the hold comes
  from a keyboard focus only and the drop releases it; no `aria-pressed` on the star, the fill axis
  added; focus after a remove; arrows on a handle; the drag preview on a semantic token. Left as
  named, not done: the jump of the list at the first star, `cdkScrollable` of the drawer, the sync
  between tabs, one computed per row. Affected stage of the plan: 2, 3.

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

- The owner's remarks: «Избранное почему на русском лейбл???? внутри избранного вместо звездочек минус убрать из избранного, иконка когда айтим не в избранном полая а в выбранном закрашенная и в цвет темы + можно задавать любой цвет из апки, + фейворит включается для каждго отдельного раздела меню по дефолту выключен, иконка драга не та смотри на динамик селекторе».
- Done by them: `favoritesSection` in the logic, the block and the stars read it; `ISideMenu.Item.favorites`; the remove button `side-menu-favorite-remove`; the star and the handle became `mat-icon-button` of 32 px; the `drag` label. Scenarios SC-UK-93…95 added, SC-UK-79 changed its meaning; the agreement revised.
- `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 7 suites, 146 passed; `node tools/check-specs.mjs` — only the four divergences of `main`; `pnpm run check:all` — green for 110 projects.
- The showcase on 6006 (the owner's), `SubMenuFavorites`: heading "Favourites"; the filled star `star` rgb(66, 132, 215), the value of `--rt-icon-accent-primary`, opacity 1; the hollow `star_border` rgb(116, 116, 116), opacity 0 without hover; `--rt-side-menu-favorite-color` on `body` gave rgb(200, 30, 90); the handle a `BUTTON` of 32 px with `open_with`; Collections — one row `20`, 4 stars; Test — no rows, 0 stars; the minus of the hovered block row opacity 1, of the rest 0; document overflow 0. The list in the showcase storage is the owner's own clicking, `5, 6, 3, 2, 4`, left as is.

- The owner: «иконки кривые новые, проверь внимательно, в моках в саб меню нет папок, ревью изменений независимыми агентами».
- The icons: a `mat-icon` of 24 px inside a 32 px button whose padding counts a 20 px icon — offsets 6, 2, 6, 2 px; after the icon took the button's size — 6 px on every side for the star, the remove button and the handle. The story got two nested folders in "Content" and the flag on "Test long name"; stars stand on items inside folders and not on folder headers.
- Three reviews in parallel; findings above. `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 8 suites, 156 passed; the favourites spec split into two files with a shared harness `side-menu-favorites.harness.ts`; `pnpm run check:all` — green for 110 projects; `node tools/check-specs.mjs` — only the four divergences of `main`.
- The showcase on 6006: offsets 6 px on every side; the filled star `FILL 1`, the hollow `FILL 0`; the Material touch target `none` under a mouse; the drag preview rgb(255, 255, 255) with `--rt-shadow-md`, rgb(28, 27, 30) under the dark theme; the filled star rgb(109, 150, 232) under the dark theme; the one `aria-pressed` left belongs to the pin of the submenu.

- The owner: «лейбл Favourites и иконку крупнее чутка и возможность задать цвет любой, почему иконка звезды синяя я просил цвет темы или кастомный задать переопределив css переменную».
- The cause: the star took `--rt-icon-accent-primary`, the kit's own blue palette (#4284d7), while the showcase's Material theme is violet (`mat.$violet-palette`, #7d00fa). The showcase theme is built by `define-theme` and declares no `--mat-sys-*`; the primary colour lives in the component tokens, `--mat-button-filled-container-color` among them. The chain now: `--rt-side-menu-favorite-color` → `--mat-sys-primary` → `--mat-button-filled-container-color` → `--rt-icon-accent-primary`.
- The showcase on 6006: the filled star and the heading's star rgb(125, 0, 250); `--rt-side-menu-favorite-color` on the menu gave rgb(230, 120, 0) to both, `--rt-side-menu-favorites-title-color` gave rgb(0, 128, 90) to the label; the heading 14 px, its star 16 px with `FILL 1`, centres matched. `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 156 passed; `node tools/check-specs.mjs` — the four divergences of `main`.

- The owner: «иконка драга справа после минуса, тут еще есть кастомный пугкт меню Галерея с разделителем, фейворит будет перед ним и тоже с разделителем отступы будут одинаковые?».
- The handle moved after the item and into the column of the list's stars by a negative margin equal to the list item's trailing space. The showcase on 6006: handle 271–303 px, list stars' right edge 303 px, the minus 239–271 px, the labels of block and list rows both at 113 px, overflow 0. 156 tests passed.
- "Галерея" with a divider is found neither in this tree nor in the two consumers on this machine (`web-store`, `vaping360`); the question about equal spacing is asked back to the owner with the block's numbers.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2291-side-menu-favorites

### Where we stand at the minute of the compaction

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The showcase, the texts and the gate — closed
- **Next step:** the closing — the snapshot references of the two new stories, the task folder taken apart into the archive, the PR
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2291-side-menu-favorites/progress.md`; the plan lies next to it.

### Uncommitted

```
 M favorites/favorites.logic.ts
 M side-menu.types.ts
```

### Commits over the main branch

```
0c19e6780 docs(rt:ui-kit): отправка избранного ждёт слова владельца и слияния #2292
57226c90b docs(rt:ui-kit): шаги избранного закрыты, набор проверок зелёный
457e7bd03 docs(rt:ui-kit): избранное бокового меню вошло в спек кита поддоменом
fae261a81 docs(rt:ui-kit): история изменений в описании избранного и передача сессии
f17bf8db9 feat(rt:ui-kit): витрина показывает избранное бокового меню
df79ef432 feat(rt:ui-kit): звезда у раздела и блок избранного вверху подменю бокового меню
f31a01afa feat(rt:ui-kit): сервис избранного бокового меню хранит список в localStorage
a18248377 docs(rt:ui-kit): описание избранного в боковом меню и план задачи
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
