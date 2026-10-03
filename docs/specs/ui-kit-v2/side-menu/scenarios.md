# Scenarios — the side menu

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-430 — the search goes down into folders

Given the submenu holds the folder «Отчёты» with the item «Выручка»
When the person types «выр»
Then the result holds the folder «Отчёты» with the one item «Выручка»

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-431 — a folder matched by its name stands without children

Given the submenu holds the folder «Отчёты» with the item «Выручка»
When the person types «отч»
Then the result holds the folder «Отчёты» with no items inside

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-432 — the arrows walk the visible rows

Given the submenu holds a closed folder and an item under it
When the person presses the down arrow in the search field twice
Then the highlight passes the folder and lands on the item under it, skipping the folder's rows

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-433 — the mode and the width survive a reload

Given the person pinned the submenu and dragged it to 300 pixels
When the page reloads
Then the submenu stands pinned, 300 pixels wide

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.spec.ts`.

### SC-UKV-434 — a broken storage record does not erase its neighbour

Given the record of a menu holds a non-numeric width and the pinned mode
When the menu reads its settings
Then the mode is pinned, and the design sets the width

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.logic.spec.ts`.

### SC-UKV-435 — the keyboard width steps and keeps the limits

Given the width handle is in focus, the submenu 470 pixels wide
When the person presses the right arrow
Then the width becomes 480, not 486

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-526 — a broken favourites record reads without foreign values

Given the storage record of a menu holds a favourites list with a null, an object and a repeat
When the menu reads its settings
Then the list keeps only strings and numbers, each once, in the former order, and 1 and "1" stay two ids

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.spec.ts`.

### SC-UKV-527 — a dragged favourite takes its new place and hidden ids keep theirs

Given the list holds an id whose item the menu does not show
When the person drags a row of the block to another place
Then the visible ids swap places among themselves, and the hidden id stays in its cell of the list

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.spec.ts`.

### SC-UKV-528 — the block shows the favourites of the open section in the order of the list

Given the list holds ids of two sections, one of them lying in a folder, and an id the menu lacks
When the person opens one section
Then the block shows only that section's items, folders included, in the order of the list, without the missing id

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.spec.ts`.

### SC-UKV-529 — a star stands on items with an address only

Given a section holds items with an address, a folder and an item marked `favoriteDisabled`
When the submenu of the section is shown
Then only the items with an address and without the mark carry a star

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.spec.ts`.

### SC-UKV-530 — favourites stand only in a section that turned them on

Given one rail item carries the `favorites` flag and its neighbour does not
When the submenu of either is shown, including after the application passed the menu anew as new objects
Then the block and the stars stand only in the section with the flag

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.spec.ts`.

### SC-UKV-531 — a Material name of the first kit is drawn by its pair

Given items carry a kit name, a first-kit Material name with a pair and a name the kit does not draw
When the menu draws their icons
Then the kit name stands as is, the Material name by its pair, and the third gets no kit icon

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.logic.spec.ts`, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.component.spec.ts`.

### SC-UKV-532 — a name the kit does not draw takes the own icon template

Given the menu carries a `rtSideMenuIcon` template and items with and without a kit icon
When the menu is drawn
Then only the item without a kit icon shows the template, which receives that item

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.component.spec.ts`.

### SC-UKV-533 — a name left without an icon is named in a warning

Given items and row buttons carry names the kit does not draw
When the menu is drawn in development, with and without its own template
Then the warning names each such name once; the template silences the items and the buttons alike

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.logic.spec.ts`, `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-icon.component.spec.ts`.
