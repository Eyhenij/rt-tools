# Scenarios — the side menu

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-406 — the search goes down into folders

Given the submenu holds the folder «Отчёты» with the item «Выручка»
When the person types «выр»
Then the result holds the folder «Отчёты» with the one item «Выручка»

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-407 — a folder matched by its name stands without children

Given the submenu holds the folder «Отчёты» with the item «Выручка»
When the person types «отч»
Then the result holds the folder «Отчёты» with no items inside

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-408 — the arrows walk the visible rows

Given the submenu holds a closed folder and an item under it
When the person presses the down arrow in the search field twice
Then the highlight passes the folder and lands on the item under it, skipping the folder's rows

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-409 — the mode and the width survive a reload

Given the person pinned the submenu and dragged it to 300 pixels
When the page reloads
Then the submenu stands pinned, 300 pixels wide

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.spec.ts`.

### SC-UKV-410 — a broken storage record does not erase its neighbour

Given the record of a menu holds a non-numeric width and the pinned mode
When the menu reads its settings
Then the mode is pinned, and the design sets the width

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.logic.spec.ts`.

### SC-UKV-411 — the keyboard width steps and keeps the limits

Given the width handle is in focus, the submenu 470 pixels wide
When the person presses the right arrow
Then the width becomes 480, not 486

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.
