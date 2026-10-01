# What it is carried out by — the side menu

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **Which items are active comes from outside.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:activeMenuIds`
- **The submenu is held open by hover or by pinning.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:subMenuOpened`. Holding by the search field stands at `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:isSearchHeld`
- **The mode and the width of the submenu are kept under the menu id and survive a reload.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.ts:RtSideMenuSettingsService`. The record is patched by `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.logic.ts:patchSideMenuSettings`
- **A storage refusal does not stop the menu.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.logic.ts:parseSideMenuSettingsRecord`. A refused write leaves the choice in the service memory, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.ts:setSubMenuMode`
- **The search goes down into folders and keeps only what matched.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:filterSideMenuItems`
- **The folders of the result stand open, and an erased query brings back the former opening.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:sideMenuIdsToExpand`. The opening is assembled at `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.ts:expandedMenuIds`
- **Every occurrence of the query is marked in a label, not the whole label.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:splitSideMenuTitle`
- **The keyboard walks the visible rows.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-keyboard.ts:RtSubMenuKeyboard`. The rows are walked by `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:walkSideMenuItems`
- **The width of the submenu is dragged by a handle between 120 and 480 pixels.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:clampSideMenuWidth`. The keyboard step stands at `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:sideMenuWidthByKey`
- **An empty `menuId` reads as an unset one — the id `main`.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.logic.ts:normalizeSideMenuId`
- **Favourites stand only in the submenu of an item that turned them on, and only with the menu settings.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.ts:sideMenuFavoritesSection`
- **A star stands on items with an address; a row of the block carries «remove» and a drag handle.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.ts:isSideMenuFavoriteCandidate`
- **The favourites and the collapsed blocks are kept in the menu settings under its id.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.ts:toggleFavorite`
- **A folder of the submenu and the favourites block are expansion panels of the kit.** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item.component.html:rt-expansion-panel`
- **On a narrow screen the menu is one column 240 pixels wide.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.component.scss:rt-side-menu-mobile-width`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
