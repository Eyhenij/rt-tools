# Scenarios — a tree of options in a choice from a list

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-408 — a flat list draws as before

Given a select or a multiselect whose options have no children
When the list is opened
Then no row carries an arrow or an empty place for one, and no row is indented

Covered by the component specs of both families.

### SC-UKV-409 — a tree is flattened into visible rows by level

Given options with children, some branches open
When the visible rows are computed
Then the rows of an open branch follow it one level deeper, the rows of a folded branch are absent,
and a leaf in a tree is marked as having no arrow

Covered by the spec of the shared tree module.

### SC-UKV-410 — a click on the arrow opens and folds a branch without choosing

Given an open select with a tree, a branch folded
When the person clicks its arrow
Then its children appear one step deeper, nothing is chosen and the panel stays open; a second
click folds it

Covered by the component spec of the select family.

### SC-UKV-411 — the select chooses a branch by its label

Given an open select with a tree
When the person clicks the label of a branch
Then the branch's value is chosen and the panel closes

Covered by the component spec of the select family.

### SC-UKV-412 — the multiselect chooses the leaves of a branch

Given an open multiselect with a tree
When the person clicks a branch with no leaf chosen
Then every enabled leaf below it is chosen and the branch's own value is not; a second click clears
them

Covered by the component spec of the multiselect family.

### SC-UKV-413 — the branch checkbox is derived from its leaves

Given a multiselect branch with two enabled leaves
When one of them is chosen, then both, then none
Then the branch's checkbox is partial, then on, then off

Covered by the spec of the shared tree module and the component spec of the multiselect family.

### SC-UKV-414 — the branches holding a chosen value are open when the list opens

Given a tree with a chosen value two levels deep
When the list is opened
Then both of its ancestors are open and the chosen row is visible

Covered by the spec of the shared tree module.

### SC-UKV-415 — the filter keeps the path to a match open

Given a select with a filter and a tree whose matching leaf lies in a folded branch
When the person types part of the leaf's label
Then the leaf and its ancestors are visible, and rows without a match below them are gone

Covered by the spec of the shared tree module and the component spec of the select family.

### SC-UKV-416 — the side arrows work the tree

Given an open select with a tree and a folded branch highlighted
When the person presses ArrowRight, ArrowRight again, then ArrowLeft twice
Then the branch opens, the highlight moves to its first child, returns to the branch, and the branch
folds

Covered by the component spec of the select family.

### SC-UKV-417 — a chip takes its label from any depth of the tree

Given a multiselect with a chosen leaf two levels deep
When it is drawn
Then the chip shows the leaf's label, not its value

Covered by the component spec of the multiselect family.
