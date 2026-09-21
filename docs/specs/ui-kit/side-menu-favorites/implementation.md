# What it is carried out by — favourites of the side menu

The rule of the subdomain is on the left, the place where it is carried out is on the right. The paths are
given from the root of the tree.

- **Favourites are switched on by providing the service, and without it the menu is as before.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts:favorites`, `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.ts:favorites`
- **The list is held by the service, and the application reads and writes it through the same service.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-favorites.service.ts:RtuiFavoritesService`
- **The service is provided once, in the application's environment injector, and the menu reads it optionally.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-favorites.service.ts:provideRtuiFavorites`
- **The list is kept in the browser storage under a key the consumer may name.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-favorites.service.ts:#write`, the key by default — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts:FAVORITES_KEY`
- **A broken record in the storage reads as an empty list, and a failed write keeps the list in memory.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts:parseFavorites`, `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-favorites.service.ts:#write`
- **Only ids are kept; the row is built from the menu's own items.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts:findFavoriteItems`
- **An id the menu does not have is not shown, and it stays in the list.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts:findFavoriteItems`
- **A star stands on every submenu item with an address of its own, folders excluded.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts:isFavoriteCandidate`, the markup — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.html:side-menu-favorite-star`
- **A row of the block carries its own filled star.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.html:rtui-side-menu-sub-item`
- **An item in the list carries a filled star, the rest an outlined one.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.html:isFavorite`
- **The outlined star shows on hover and on keyboard focus of its row; the filled star always shows.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.scss:__star`
- **The star carries a tooltip and an accessible name: "Add to favourites" or "Remove from favourites".** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.html:matTooltip`
- **A press of the star switches the favourite and does nothing else.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.ts:onToggleFavorite`
- **The block stands at the top of every open submenu, under the search field and above the list.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.html:rtui-side-menu-favorites`
- **The block shows the favourites in the order of the list.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts:rows`
- **The block with nothing to show takes no place.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.html:rows`
- **While the search query is not empty, the block is hidden.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts:rows`
- **A row of the block opens its item the same way as the row in the list does.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:onClickSubMenu`
- **A row of the block is marked active by the same rule as the row in the list.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.html:activeMenuIds`
- **A row of the block carries no page id of its item and no keyboard ring.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu-sub-item/rtui-side-menu-sub-item.component.ts:inFavorites`
- **A row of the block is dragged by its handle, and the new order is kept at the drop.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts:onDrop`
- **A drop moves the dragged id next to its visible neighbour, and hidden ids keep their places.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/favorites.logic.ts:moveVisibleFavorite`
- **While a row is dragged, the submenu stays open in either mode.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts:onDragStart`, the hold — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-sub-menu-hold.service.ts:RtuiSubMenuHoldService`
- **A dropped row outside the block changes nothing.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-side-menu-favorites.component.ts:onDrop`
- **The block does not keep open a pinned panel that has nothing else to show.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.ts:subMenuOpened`
- **The labels are sewn in in English and are replaced by the provider settings.** — `projects/ui-kit/src/lib/ui-kit/side-menu/favorites/rtui-favorites.service.ts:labels`
- **On a narrow screen the block stands the same, under the search of the submenu.** — `projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.html:rtui-side-menu-favorites`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a table
here: the bond is checked both ways by the checking of the specs.
