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
Then its handle is a button with the icon of the settings, `arrows_outward` by default, named
"Hold button to drag"

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

### SC-UK-108 — a favourites write keeps the mode, the width and unknown fields of the same menu

Given the settings of `user-a` hold the mode `pinned`, the width 320 and a field the kit does not know
When `a` is added to the favourites of `user-a`
Then the record of `user-a` holds `a`, the mode `pinned`, the width 320 and the unknown field

### SC-UK-109 — a write of any field of one menu does not change another menu

Given the settings of `user-a` and `user-b` are stored
When the favourites, the mode and the width of `user-a` are written
Then the record of `user-b` stays as it lay

### SC-UK-110 — a write made by other code after the service started is not erased

Given the service has read the storage
When other code writes the settings of `user-b`, and then the service writes the favourites of
`user-a`
Then the record holds both: the settings of `user-b` from the other code and the list of `user-a`

### SC-UK-111 — the storage event of another tab updates the list, the mode and the width

Given the service is up and the storage is changed by another tab
When the storage event arrives for the settings key
Then the list, the mode and the width of the menu show what the other tab wrote

### SC-UK-112 — an invalid mode and width read as no value, and the neighbouring fields stay

Given the settings of a menu hold the mode `sideways`, the width `"wide"` and a list `a`
When the service reads them
Then the mode is `hover`, the width is empty, the list is `a`

### SC-UK-113 — changing the menu id shows the settings of the new id, and the old ones stay

Given the settings of `user-a` and `user-b` differ in the list and the mode
When the menu changes its id from `user-a` to `user-b`
Then the menu shows the list and the mode of `user-b`, and the record of `user-a` is not touched

### SC-UK-114 — a closed or full storage does not take the write down, and the settings live in memory

Given the storage throws on reading and writing, or only on writing because it is full
When favourites, the mode and the width are written
Then nothing throws, and the service shows what was written

### SC-UK-115 — the menu takes its mode and width from its settings and writes the person's choice

Given a menu with an id, no mode or width from the application, and settings holding the mode
`pinned`
When the person presses the switch of the mode or pulls the edge of the submenu
Then the submenu opens pinned, and the new mode or width goes into the settings of that id; a mode
given by the application wins over the stored one and leaves it untouched

### SC-UK-116 — the settings of a menu are deleted only by the application's call, and only them

Given the settings of `user-a` and `user-b` are stored
When the application deletes the settings of `user-a`
Then the record holds only `user-b`

### SC-UK-117 — an empty menu id reads and writes as the default one

Given the settings of the default menu hold the mode `pinned`
When the menu gets an empty id, or the application calls the service with an empty or blank id
Then the menu opens pinned, the switch writes into the default menu, and the service reads and
writes the default menu's settings

### SC-UK-118 — the application moves among the shown ids, and the hidden ones keep their places

Given the list `a`, `x`, `b`, `c`, where `x` is not shown, and another tab has just added `d`
When the application moves the first shown id of `a`, `b`, `c` to the last place
Then the list is `b`, `x`, `c`, `a`, `d`; an id the list does not hold is ignored among the shown

### SC-UK-119 — a dragged row that disappears releases the hold

Given the service and a hover submenu with favourites in two sections
When a row of the first section is taken by its handle, the pointer opens the second section, and
then leaves the panel
Then the submenu closes

### SC-UK-120 — a row dropped outside the panel closes a hover submenu

Given the service and a submenu opened by hover
When a row is dropped inside the panel, and then another drop lands outside it
Then the submenu stays open after the first drop and closes after the second

### SC-UK-121 — without icons in the settings the remove button draws a trash can

Given the service provided without `icons`
When the block is drawn with `a` in the list
Then the remove button draws `delete` without a turn, the handle draws `arrows_outward` turned by
90°

### SC-UK-122 — a set remove icon changes the glyph and keeps the tooltip

Given the service provided with `icons.remove` of the glyph `close`
When the block is drawn with `a` in the list
Then the remove button draws `close`, its tooltip stays "Remove from favourites", and the handle
keeps its default icon; a blank glyph leaves the trash can

### SC-UK-123 — a set handle icon is drawn with its own turn

Given the service provided with `icons.drag` of the glyph `drag_indicator` and the turn 0
When the block is drawn with `a` in the list
Then the handle draws `drag_indicator` without a turn; an icon without a turn is not turned

### SC-UK-124 — the remove icon turns red under the pointer

Given the service with `a` in the list and a wide screen with a hovering pointer
When the pointer stands on the remove button of the row `a`
Then its icon takes `--rt-side-menu-favorite-remove-hover-color`, the danger colour by default; the
star of a list row keeps its colours

Coverage: partial — the spec checks the mark the styles read, not the colour itself: the spec
environment applies no component styles and has no hover. The colour is shown by the showcase frame
of the pointer on the remove button.

### SC-UK-134 — a flagged item draws no star and is not a candidate

Given a flagged section with the submenu items `a` and `b`, `b` flagged `favoriteDisabled`
When the submenu is drawn
Then the row `a` carries a star and the row `b` carries none; `isFavoriteCandidate(b)` is false

### SC-UK-135 — a stored id of a flagged item stays out of the block

Given the list holds `a` and `b`, and `b` is flagged `favoriteDisabled`
When the block of the section is drawn
Then it shows only `a`, and the list still holds `b`

### SC-UK-136 — the heading collapses the block and keeps the divider

Given the block of a section with `a` and `b`
When the person presses the heading
Then the rows are gone, the heading reads "Favourites (2)", carries `aria-expanded="false"` and
names the list by `aria-controls`, and the divider under the block stays; a second press brings the
rows back

### SC-UK-137 — Enter and Space switch the heading

Given the block of a section with `a`, its heading focused
When the person presses Enter, then Space
Then the block collapses and expands again; the heading is a button, so the keys are its own

Coverage: partial — the spec checks that the heading is a button in the Tab order; the spec
environment does not turn Enter and Space into a click, the browser does.

### SC-UK-138 — the collapsed state is kept per section under the menu id

Given two flagged strip items `s1` and `s2` with favourites in both
When the block of `s1` is collapsed
Then the settings of the menu hold `favoritesCollapsed: ['s1']`, the block of `s2` stays expanded,
and a service created anew reads `s1` collapsed

### SC-UK-139 — the toggle is named by the labels of the settings

Given the service provided with `labels.expand` and `labels.collapse`
When the block is expanded, then collapsed
Then the heading's `aria-label` is the collapse label, then the expand label; without them it is
"Collapse favourites" and "Expand favourites"

### SC-UK-140 — the menu gives up the width of hidden row buttons by the input

Given the menu with `favoriteActionsReserve="none"`
When the submenu is drawn
Then the menu host carries the mark the styles read to take the width from hidden buttons; without
the input it carries none

Coverage: partial — the spec checks the mark, not the width: the spec environment applies no
component styles and has no hover. The width is shown by the showcase frames of a row at rest and
under the pointer.
