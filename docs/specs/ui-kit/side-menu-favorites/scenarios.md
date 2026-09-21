# Scenarios — favourites of the side menu

The identifier goes at the start of the test title, followed by a dash. The prefix is shared with
the domain; the numbers continue after the last one issued in it.

## The service

### SC-UK-69 — the list outlives a new service over the same storage

Given the service with a key and the ids `a`, `b` added in that order
When a second service is created over the same storage and key
Then its list is `a`, `b`

### SC-UK-70 — a broken record reads as an empty list

Given the storage holds under the key a value that is not JSON, or JSON that is not an object
When the service is created
Then its list is empty and nothing is thrown

### SC-UK-71 — foreign values and duplicates are dropped at the read

Given the storage holds under the key the menu `main` with `["a", 1, null, {"x": 1}, "a"]`, the
menu `broken` whose value is a number and the menu `empty` whose list is not an array
When the service is created
Then the list of `main` is `a`, `1`, the list of `empty` is empty, and the stored menus are `main`
and `empty`

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

Given the service and an open submenu of a favourites section with an item, a folder and an item
inside the folder
When the folder is open
Then both items carry a star and the folder header does not

### SC-UK-77 — the star shows the state and names the next press

Given the service with `a` in the list and an open submenu with the items `a` and `b`
When the submenu is drawn
Then the star of `a` is filled — `star` — and named "Remove from favourites", and the star of `b`
is hollow — `star_border` — and named "Add to favourites"

### SC-UK-78 — a press of the star switches the favourite and opens nothing

Given the service, an empty list and an open submenu with the item `a`
When the star of `a` is pressed
Then the list is `a`, the item output did not fire, the submenu stays open, and the star of `a` is
filled and named "Remove from favourites"

### SC-UK-79 — the block shows only the favourites of the open section, in the order of the list

Given two favourites sections and the list `c`, `b`, `a`, where `a` and `b` lie in the submenu of the
first section and `c` in the second
When the submenu of the first section is open, then the submenu of the second
Then the block shows the rows `b`, `a` first, then the one row `c`

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
избранного", "Потяните за кнопку"
When the submenu is drawn with `a` in the list and `b` out of it
Then the heading, the names and tooltips of the star of `b`, the remove button and the handle
carry these labels

### SC-UK-86 — on a narrow screen the block and the stars stand the same

Given a narrow screen, the service with `a` in the list and an open submenu
When the submenu is drawn
Then the block with the row `a` stands under the search field, the hollow stars and the remove
buttons are shown without a hover, their tooltips are off, and the row back to the main list carries
no star

### SC-UK-87 — a drop keeps the places of the ids the menu does not have

Given the service with the list `a`, `gone`, `b`, and a menu with no item `gone`
When the row `b` is dropped at the first place of the block
Then the rows are `b`, `a`, and the list is `b`, `gone`, `a` — `gone` stays at its own place

### SC-UK-88 — the bringing into view aims at the list row, not at the block row

Given the service with `a` in the list, `a` active, and an open submenu with the item `a`
When the submenu is drawn
Then exactly one node of the page carries the id of `a`, and it lies in the list, not in the block

### SC-UK-89 — the hollow star shows on hover and on focus, the filled one always

Given the service with `a` in the list and a wide screen with a hovering pointer
When the submenu is drawn, then the row `b` is hovered, then its star is focused from the keyboard
Then the star of `a` is visible from the start, and the star of `b` only under the hover and under the
keyboard focus; a star pressed by the mouse hides when the pointer leaves

Coverage: partial — the spec checks the marks the styles read, not the visibility itself: the spec
environment applies no component styles and has no hover. The visibility is measured on the showcase.

### SC-UK-90 — the keyboard focus on a star or a remove button holds a submenu opened by hover

Given the service and a submenu opened by hover
When a star or a remove button is focused from the keyboard, or a row is taken by its handle, and
the pointer leaves the panel
Then the submenu stays open

### SC-UK-91 — a drop outside the block changes nothing

Given the service with the list `a`, `b`
When the row `a` is dragged out of the block and dropped there
Then the list is `a`, `b`

### SC-UK-92 — a row of the block is marked active as the list row is

Given the service with `a` in the list and `a` named active
When the submenu is drawn
Then the row `a` of the block is marked active

### SC-UK-93 — a section without the flag shows neither stars nor the block

Given the service with a list that is not empty and a strip item without the `favorites` flag
When the submenu of that item is open
Then there is no star on any row and no favourites block

### SC-UK-94 — a row of the block carries a remove button, and it removes the item

Given the service with the list `a`, `b` and the block drawn
When the remove button of the row `a` is pressed
Then the row carries no star, the button is named "Remove from favourites", the list and the rows
are `b`, and the item output did not fire

### SC-UK-95 — the handle is a button with the outward arrows inside the item

Given the service with `a` in the list and the block drawn
When the row `a` is looked at
Then its handle is a button with the icon `arrows_outward` named "Hold button to drag"

### SC-UK-96 — an empty panel shows no one's favourites

Given a flagged section active with favourites, and a strip item whose submenu is empty
When the empty strip item is hovered
Then there is no favourites block, though the active section has favourites

### SC-UK-97 — the menu passed again in new objects keeps the block and the stars

Given the service with the list `b`, `a` and the open submenu of their section
When the application passes the same menu again in new objects
Then the block is still `b`, `a`, and the stars stay

### SC-UK-98 — a mouse focus does not hold the submenu, and a drop releases it

Given the service and a submenu opened by hover
When a star is focused by a mouse press and the pointer leaves the panel; then, reopened, a row is
dragged, dropped and the pointer leaves
Then the submenu closes both times

### SC-UK-99 — after a remove the focus stands on the neighbouring row

Given the service with the list `a`, `b`, the block drawn and the focus on the remove button of `a`
When that button is pressed
Then the block is `b`, and the focus stands on the remove button of `b`

### SC-UK-100 — the arrows on a handle reorder the rows

Given the service with the list `a`, `b`, `c` and the block drawn
When ArrowDown is pressed on the handle of `a`, then ArrowUp twice on the same handle
Then the list is `b`, `a`, `c` with the focus on the handle of `a`, then `a`, `b`, `c`, and the
second ArrowUp at the first place changes nothing

### SC-UK-101 — a pinned submenu takes the section of the picked item, or of the active one

Given the pinned mode, two flagged sections and one without the flag, the first section active
When the submenu is drawn, then the section without the flag is picked, then the second flagged one
Then the block shows the first section's favourites, then nothing and no stars, then the second
section's favourites and its stars

### SC-UK-102 — a drop keeps the places of the ids of other sections

Given two flagged sections and the list `a`, `c`, `b`, where `c` lies in the second
When in the first section the row `b` is dropped at the first place
Then the rows are `b`, `a`, and the list is `b`, `c`, `a`

### SC-UK-103 — the header of a folder in a favourites section is marked for the column of the stars

Given a flagged section and a section without the flag, each holding a folder
When the submenu of each is drawn
Then the folder header of the flagged section carries the favourites modifier, the other does not

### SC-UK-104 — the consumer's button stands last in the row

Given a flagged section whose item carries the consumer's additional button and is a favourite
When the submenu is drawn
Then the consumer's button is the last in the list row, right after the star, and the last in the
block row, right after the handle

### SC-UK-105 — two menus keep their lists under their ids in one key

Given an empty storage
When the menu `main` gets `a`, `b`, the menu `admin` gets `x`, `a` is removed from `admin` and the
first entry of `main` is moved to the second place
Then `main` holds `b`, `a`, `admin` holds `x`, the storage holds both under their ids, and a new
service reads `admin` back

### SC-UK-106 — the application sees the stored menu ids and reads any menu's list

Given the storage holds the menu `main`
When the service is created, then `x` is added to the menu `admin`
Then the stored ids are `main`, then `main` and `admin`; the list of a menu is one signal for every
call, and a menu never stored has an empty list

### SC-UK-107 — a menu with its own id shows and edits its own list

Given the list of the default menu is `a` and the list of the menu `admin` is `b`
When the menu takes the id `admin`, its section is opened and the star of `a` is pressed
Then the block shows `b`, the list of `admin` becomes `b`, `a`, and the default menu keeps `a`
