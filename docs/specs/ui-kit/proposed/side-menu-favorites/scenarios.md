# Scenarios — favourites of the side menu

The identifier goes at the start of the test title, followed by a dash. The prefix is shared with
the domain; the numbers continue after the last one issued in it.

## The service

### SC-UK-69 — the list outlives a new service over the same storage

Given the service with a key and the ids `a`, `b` added in that order
When a second service is created over the same storage and key
Then its list is `a`, `b`

### SC-UK-70 — a broken record reads as an empty list

Given the storage holds under the key a value that is not JSON, or JSON that is not an array
When the service is created
Then its list is empty and nothing is thrown

### SC-UK-71 — foreign values and duplicates are dropped at the read

Given the storage holds `["a", 1, null, {"x": 1}, "a"]` under the key
When the service is created
Then its list is `a`, `1`

### SC-UK-72 — add, remove and toggle edit the list and the storage together

Given an empty list
When `a` is added twice, `b` is toggled on, `a` is removed and `b` is toggled off
Then after each step the list and the stored value are the same, and the last is empty

### SC-UK-73 — move puts an entry to a new place and keeps the rest in order

Given the list `a`, `b`, `c`
When the entry at 0 is moved to 2
Then the list is `b`, `c`, `a` and the storage holds the same

### SC-UK-74 — set and clear replace the list whole

Given the list `a`, `b`
When `set(["c", "c", "d"])` is called, then `clear()`
Then the list is first `c`, `d`, then empty, and the storage holds the same each time

## The menu

### SC-UK-75 — without the service the submenu has no stars and no block

Given a side menu with an open submenu and no favourites service provided
When the submenu is drawn
Then there is no star on any row and no favourites block

### SC-UK-76 — a star stands on items with an address and not on folders

Given the service and an open submenu with an item, a folder and an item inside the folder
When the folder is open
Then both items carry a star and the folder header does not

### SC-UK-77 — the star shows the state and names the next press

Given the service with `a` in the list and an open submenu with the items `a` and `b`
When the submenu is drawn
Then the star of `a` is pressed, filled and named "Remove from favourites", and the star of `b` is
not pressed, outlined and named "Add to favourites"

### SC-UK-78 — a press of the star switches the favourite and opens nothing

Given the service, an empty list and an open submenu with the item `a`
When the star of `a` is pressed
Then the list is `a`, the item output did not fire, and the submenu stays open

### SC-UK-79 — the block shows the favourites in the order of the list, from any section

Given the service with the list `c`, `a`, where `a` lies in the submenu of one strip item and `c` in
another
When the submenu of a third strip item is open
Then the block stands above the list with the rows `c`, `a` in that order

### SC-UK-80 — an id the menu does not have is not shown and stays in the list

Given the service with the list `a`, `gone`, and a menu with no item `gone`
When the submenu is drawn
Then the block has one row `a`, and the list is still `a`, `gone`

### SC-UK-81 — the block with nothing to show takes no place

Given the service with a list whose ids the menu does not have
When the submenu is drawn
Then there is no favourites block and no heading of it

### SC-UK-82 — a query in the search hides the block

Given the service with `a` in the list and an open submenu
When a query is typed into the search field
Then the block is gone, and it is back when the query is emptied

### SC-UK-83 — a row of the block opens its item as the list row does

Given the service with `a` in the list and an open unpinned submenu
When the row `a` of the block is pressed
Then the item output fires with the item `a`, and the submenu closes as it does after a press on the
list row

### SC-UK-84 — a drop by the handle keeps the new order

Given the service with the list `a`, `b`, `c` and the block drawn
When the row `a` is dropped at the third place of the block
Then the rows and the list are `b`, `c`, `a`

### SC-UK-85 — the labels are replaced by the provider settings

Given the service provided with the labels "Избранное", "Добавить в избранное", "Убрать из
избранного"
When the submenu is drawn with `a` in the list and `b` out of it
Then the heading, the name of the star of `b` and of the star of `a` carry these labels

### SC-UK-86 — on a narrow screen the block and the stars stand the same

Given a narrow screen, the service with `a` in the list and an open submenu
When the submenu is drawn
Then the block with the row `a` stands under the search field, and the outlined stars are shown
without a hover

### SC-UK-87 — a drop keeps the places of the ids the menu does not have

Given the service with the list `a`, `gone`, `b`, and a menu with no item `gone`
When the row `b` is dropped at the first place of the block
Then the rows are `b`, `a`, and the list is `b`, `gone`, `a` — `gone` stays at its own place

### SC-UK-88 — the bringing into view aims at the list row, not at the block row

Given the service with `a` in the list, `a` active, and an open submenu with the item `a`
When the submenu is drawn
Then exactly one node of the page carries the id of `a`, and it lies in the list, not in the block

### SC-UK-89 — the outlined star shows on hover and on focus, the filled one always

Given the service with `a` in the list and a wide screen with a hovering pointer
When the submenu is drawn, then the row `b` is hovered, then its star is focused from the keyboard
Then the star of `a` is visible from the start, and the star of `b` only under the hover and under the
focus

### SC-UK-90 — the focus on a star holds a submenu opened by hover

Given the service and a submenu opened by hover
When a star is focused and the pointer leaves the panel
Then the submenu stays open

### SC-UK-91 — a drop outside the block changes nothing

Given the service with the list `a`, `b`
When the row `a` is dragged out of the block and dropped there
Then the list is `a`, `b`

### SC-UK-92 — a row of the block is marked active as the list row is

Given the service with `a` in the list and `a` named active
When the submenu is drawn
Then the row `a` of the block is marked active
