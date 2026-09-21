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

- The owner: «иконка драга внутри айтима + сама иконка стрелка ввех и вниз», «в запиненом режиме тень внизу свбменю с кнопкой сколл даун закруглена», «иконка минус и иконка драга должны быть прижаты к правому краю, на папке иконка шеврона имеет другой отступ», «добавь моков» с кнопкой «+», «иконка драга на фейворит видна тоже на ховер как и минус», «плюсик должен быть в конце айтима так как он всегда отображается а остальное на ховер».
- The handle went inside the item through a projection slot, took the `height` icon and the hover visibility of the remove button; its styles left `:host`, and the drag preview keeps 32 px, a 20 px icon and the grey colour. The pinned panel is square: the rounded corner of the drawer with `overflow: auto` cut the scroll hint, radius now 0 px. The folder chevron moved by a 4 px outer margin — Material rotates the indicator with its padding, so uneven padding flipped sides on an open folder. The consumer's "+" stands last; in a favourites section it moves by 3 px into the column.
- The showcase on 6006: the handle, the star, the chevron and the "+" all centre on 287 px; a block row with "+" reads remove 205–237, handle 234–266 under hover, "+" 274–300; overflow 0. `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 158 passed with SC-UK-103 and SC-UK-104; stylelint and eslint clean; `node tools/check-specs.mjs` — the four divergences of `main`.

- The owner: «новые стили через переменные с возможностью изменять в приложении в котором будет использоваться?», «мейн подтяни».
- `origin/main` merged in, 57 commits, none in the kit; the layout check matches package v0.29.0. Eleven properties `--rt-side-menu-favorite-*` and `--rt-side-menu-favorites-*` plus `--rt-side-menu-sub-menu-pinned-radius`, none declared in the kit, each read with its default as the fallback; a shared SCSS partial was refused by the kit's token lint, so each use carries the property inline. The chevron and the "+" offsets are derived from the button size.
- The showcase on 6006: defaults unchanged — column 287 px, star rgb(125, 0, 250), heading 14 px, divider rgb(232, 232, 232) 8 px, pinned radius 0 px. Set on `:root`: button 40 px with the column still shared at 283 px by stars, "+" and chevron, colours, heading 18 px, divider 12 px and pinned radius 12 px all took. `node tools/check-specs.mjs` — green, the `main` divergences are gone.

- The owner: «при снятии фейворита икнонка звезды остается даже при снятии ховера». The cause: a button pressed by the mouse keeps the focus, and the row showed its buttons under `:focus-within`. Now under `:has(:focus-visible)` — the keyboard focus only — for the star, the remove button and the handle. Not confirmed in the browser: the driver's clicks did not reach the page in this session (the star stayed unfocused and unchanged after three real clicks), so the owner's look confirms it. 158 tests passed, `node tools/check-specs.mjs` green.

- The owner: «название сервиса должно отсылать к сайд меню», «иконка драга используй arrows_outward только поверни на 90 градусов». Renamed: `RtuiSideMenuFavoritesService`, `provideRtuiSideMenuFavorites()`, `RTUI_SIDE_MENU_FAVORITES_CONFIG`, `IRtuiSideMenuFavoritesConfig`, `IRtuiSideMenuFavoritesLabels`, files `rtui-side-menu-favorites.service(.spec).ts`; the storage key stays `rtui-side-menu-favorites`. The handle icon is `arrows_outward` with `rotate(90deg)`.
- Found on the way: the showcase on 6006 loads the static Material Icons font, which has no `arrows_outward` — the handle there shows the word, measured glyph height 280 px. Avalon draws a Material Symbols subset from `app-icon-glyphs.const.ts`, and the list lacks `arrows_outward` and `star_border`. Both are named to the owner; the Avalon tree is not touched.
- 158 tests passed, `node tools/check-specs.mjs` green, `pnpm run check:all` green.

- The owner: «иконку новую не вижу в сторибук пересобери». A rebuild changes nothing: the showcase font Material Icons has no `arrows_outward`. The favourites stories switched to Material Symbols, the font of the consumers: a 26 KB subset with the side menu stories' icons from the Google Fonts API lies in `projects/ui-kit/.storybook/static/fonts/material-symbols-outlined.woff2`, declared in `storybook.scss`, and the stories set the default font set class. The showcase on 6006: no icon falls back to text, the handle glyph 24×20 turned, centre 287 px; star, remove and handle all at `wght 700` — the remove icon got the outline directive. Old findings in `storybook.scss` fixed on the way. 158 tests passed.

- The owner: «в сторадже храним ключ внутри по id храним один объект с настройками для меню, id может быть несколько, id задаются/чтение из апки доступно». The second level's spec keeps the submenu mode and width with the application, so the settings object holds favourites only and is open for more fields. One key `rtui-side-menu` holds `{ [menuId]: { favorites } }`; the menu takes `menuId`, `default` by default; the service takes the menu id in every method, gives `ids(menuId)` as one signal per id and `menuIds`. `SIDE_MENU_SETTINGS_KEY`, `DEFAULT_MENU_ID` exported, `FAVORITES_KEY` gone. The showcase on 6006: the key holds the menu `showcase`, the block shows 2, 7, 9, 5. 162 tests passed with SC-UK-105…SC-UK-107; `node tools/check-specs.mjs` green.

- The owner: «проверь иконку скролл даун?». The scroll hint draws `keyboard_arrow_down`, absent from the first subset: in the favourites stories it would show the word. The subset is rebuilt from every icon name in the kit's templates plus the side menu stories' items, 47 KB. On 6006, a probe span with the font's class: 53 of 55 names draw a 24 px glyph, `keyboard_arrow_down` among them; `local_offer` (named `sell` in Symbols) and `more` (test data only) do not, and neither is in the favourites stories. The hint itself was not raised: the tab stayed in the background, and Angular did not redraw.

- The owner's spec: all settings of one menu in one record under its `menuId` — favourites, `subMenuMode`, `subMenuWidth`. The service became `RtuiSideMenuSettingsService` (`provideRtuiSideMenuSettings`, `IRtuiSideMenuSettingsConfig`, `RTUI_SIDE_MENU_SETTINGS_CONFIG`) in `side-menu/settings/`; it adds `subMenuMode`/`setSubMenuMode`, `subMenuWidth`/`setSubMenuWidth`, `settings`, `deleteSettings`. A write reads the storage, patches one field of one menu and writes; a `storage` event refreshes the signals; a failed write keeps memory authoritative. The menu's `subMenuMode`/`subMenuWidth` inputs default to none: given — they win without touching the stored value, otherwise the stored value is used and the switch and the edge write it. The old keys are not read; `readSubMenuMode` and the rest stay exported only because Avalon imports them. Scenarios SC-UK-108…SC-UK-116. `node tools/check-specs.mjs` green, `pnpm run check:all` green.

- The branch review, and the owner: «поправь реальные проблемы». An empty `menuId` — a bare attribute included — now reads and writes as `default` in the menu (input transform) and in the service (`normalizeMenuId`), SC-UK-117. The edge pull moved out of the menu into `menu/sub-menu-resize.ts`, next to the keyboard walk: the menu file stood at the 500-line limit, now 473. From the consuming application: `RtuiSideMenuSettingsService.moveVisible(menuId, visibleIds, from, to)`; the block's drop goes through it, so it reads the storage before writing, and a shown id the list lacks is skipped, SC-UK-118. 260 side-menu tests, `check:specs` and `check:all` green.

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
 M spec.md
 M ../side-menu/implementation.md
 M ../side-menu/spec.md
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.spec.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.favorites-sections.spec.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.favorites.spec.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu/side-menu-favorites.harness.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu/side-menu.harness.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/public-api.ts
RM ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.service.spec.ts -> ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/settings/rtui-side-menu-settings.service.spec.ts
RM ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.service.ts -> ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/settings/rtui-side-menu-settings.service.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/side-menu.types.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/stories/component/test-side-menu-wrapper.component.ts
 M ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu-favorites.stories.ts
?? ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.settings.spec.ts
?? ../../../../projects/ui-kit/src/lib/ui-kit/side-menu/settings/side-menu-settings.logic.ts
```

### Commits over the main branch

```
3c101f8cf fix(rt:ui-kit): в шрифте витрины — все значки шаблонов кита
8109cc0d7 feat(rt:ui-kit): настройки бокового меню в одном ключе, по номеру меню
8b26507fa fix(rt:ui-kit): витрина избранного рисует значки шрифтом Material Symbols
1ea9cbb63 refactor(rt:ui-kit): сервис избранного назван по боковому меню, ручка — arrows_outward
83f389e7a fix(rt:ui-kit): снятая мышью звезда прячется, когда указатель ушёл
5082845e1 fix(rt:ui-kit): цвета, размеры и отступы избранного — свойствами приложения
23b99cbea Merge remote-tracking branch 'origin/main' into RT-2291-side-menu-favorites
17ba8a30c fix(rt:ui-kit): ручка внутри пункта, «+» последним, шеврон в столбце звёзд
c9042b7da fix(rt:ui-kit): ручка избранного справа, после кнопки «убрать»
2cbcecb96 fix(rt:ui-kit): звезда избранного в цвете темы Material, заголовок крупнее
9a7342d4f fix(rt:ui-kit): избранное по ревью — раздел по показанному набору, удержание, клавиатура
22a9abf8f fix(rt:ui-kit): значки избранного по центру кнопки, в витрине — папки
86f46845d feat(rt:ui-kit): избранное включается у раздела, в блоке — кнопка «убрать»
0c19e6780 docs(rt:ui-kit): отправка избранного ждёт слова владельца и слияния #2292
57226c90b docs(rt:ui-kit): шаги избранного закрыты, набор проверок зелёный
457e7bd03 docs(rt:ui-kit): избранное бокового меню вошло в спек кита поддоменом
fae261a81 docs(rt:ui-kit): история изменений в описании избранного и передача сессии
f17bf8db9 feat(rt:ui-kit): витрина показывает избранное бокового меню
df79ef432 feat(rt:ui-kit): звезда у раздела и блок избранного вверху подменю бокового меню
f31a01afa feat(rt:ui-kit): сервис избранного бокового меню хранит список в localStorage
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
