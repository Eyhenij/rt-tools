# Scenarios — a tree ordered by dragging

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-654 — the drop place follows the thirds of the row

Given a container row 30 points high starting at 100
When the pointer stands at 105, at 115 and at 125
Then the place is `before`, `inside` and `after`; over a leaf at 115 there is no place

Covered by the logic test of `rt-draggable-tree`.

### SC-UKV-655 — a move gives a new array and leaves the nodes as they were

Given a tree of two top nodes and a container with two children
When the first child is moved after the second top node
Then a new array holds it at index 2 of the top level, the container keeps one child, and the
objects passed in are unchanged

Covered by the logic test of `rt-draggable-tree`.

### SC-UKV-656 — a node goes inside a container last

Given a container with one child and a top-level leaf
When the leaf is moved inside the container
Then the container holds two children, the leaf the last

Covered by the logic test of `rt-draggable-tree`.

### SC-UKV-657 — a node never goes into its own subtree

Given a container with a child container
When the outer container is offered as a move into the inner one, by a place or by a key
Then no place is offered and the order stays

Covered by the logic test of `rt-draggable-tree`.

### SC-UKV-658 — the application bans a place

Given `canDrop` that answers `false` for every place inside
When a node is offered a place inside a container
Then the place is not offered, and a place before stays offered

Covered by the logic test of `rt-draggable-tree`.

### SC-UKV-659 — Alt with ArrowUp and ArrowDown moves a node among its siblings

Given three top nodes and the second highlighted
When Alt with ArrowUp is pressed, then Alt with ArrowUp again
Then the node stands first, the second press leaves it first, and `moved` was emitted once

Covered by the component test of `rt-draggable-tree`.

### SC-UKV-660 — Alt with ArrowLeft and ArrowRight takes a node out of a branch and back

Given an open container with one child highlighted
When Alt with ArrowLeft is pressed, then Alt with ArrowRight
Then the child stands right after the container at the top level, then is the container's last
child again

Covered by the component test of `rt-draggable-tree`.

### SC-UKV-661 — a disabled node is not moved

Given a disabled top node highlighted
When Alt with ArrowDown is pressed
Then the order stays, `moved` is not emitted, and the row has no handle

Covered by the component test of `rt-draggable-tree`.

### SC-UKV-662 — a row takes the application's markup

Given a tree with a template marked by `rtDraggableTreeNode`
When the tree is drawn
Then every row holds that template with its own node in the context instead of the label

Covered by the component test of `rt-draggable-tree`.

### SC-UKV-663 — an empty tree says so

Given a tree with no nodes
When the tree is drawn
Then the kit label for no options is shown

Covered by the component test of `rt-draggable-tree`.
