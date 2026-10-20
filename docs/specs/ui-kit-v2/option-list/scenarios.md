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
