# Scenarios — the keys of an option list

The prefix `SC-UKV` is shared across the domain together with the subdomains.
The numbers do not change after the merge. What covers a scenario is said under it.

### SC-UKV-880 — a closed select opens by an arrow, Enter or Space

Given a closed select or multiselect
When the person presses ArrowDown, ArrowUp, Enter or Space
Then the list opens; any other key leaves it closed

Covered by the spec of the option-list controller.

### SC-UKV-881 — the arrows wrap and pass over disabled options

Given an open list of three options with the middle one disabled, the first highlighted
When the person presses ArrowDown, then ArrowDown again
Then the highlight goes to the third option, then back to the first

Covered by the spec of the option-list controller.

### SC-UKV-882 — Enter chooses, and Space chooses only where it does not type

Given an open list
When the person presses Enter or Space
Then Enter chooses the highlighted option in every field, and Space chooses in the select and the
multiselect but not in the autocomplete

Covered by the spec of the option-list controller.

### SC-UKV-883 — Escape closes the list

Given an open list
When the person presses Escape
Then the list closes

Covered by the spec of the option-list controller.

### SC-UKV-884 — the highlighted option is named while the list is open

Given a list with the second option highlighted
When the list is open, and then closed
Then the field names the option id `<panel id>-opt-1` while it is open, and nothing after it closes

Covered by the spec of the option-list controller.

### SC-UKV-885 — Home and End go to the first and the last enabled option

Given an open select list of four options with the first one disabled
When the person presses End, then Home
Then the highlight goes to the fourth option, then to the second; in the autocomplete both keys
are left to the text

Covered by the spec of the option-list controller.

### SC-UKV-886 — the arrows move the focus between the rows of the dynamic selector popup

Given an open dynamic selector popup with three rows and the focus in its search field
When the person presses ArrowDown, ArrowUp, End and Home
Then the focus goes to the first row, wraps to the third, stays on the third, then goes to the
first; Home and End pressed in the search field leave the focus there

Covered by the spec of the dynamic selector popup.

### SC-UKV-887 — Enter ticks the focused row of the dynamic selector popup

Given an open dynamic selector popup with the focus on the second row
When the person presses Enter
Then the second row is ticked, the same as by a click

Covered by the spec of the dynamic selector popup.

### SC-UKV-888 — Home and End in the tree move the highlight while a row is highlighted

Given a tree selector with three rows and the focus in its search field
When the person presses End, then ArrowDown, End and Home
Then End alone highlights nothing; after the arrow End highlights the last row and Home the first

Covered by the spec of the tree selector.
