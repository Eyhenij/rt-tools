# Scenarios — a tree of choice

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-672 — a click on a leaf adds it to the choice and leaves the nodes as they were

Given a tree in the multiple mode with the cascade
When a person clicks an unchosen leaf
Then `value` gets a new array holding that leaf, and the node objects passed in are unchanged

Covered by the component test of `rt-tree`.

### SC-UKV-673 — a click on a branch chooses its enabled leaves and then clears them

Given a branch whose leaves are all enabled and none chosen
When a person clicks the branch twice
Then after the first click every leaf of the branch is in the choice, and after the second none is

Covered by the component test of `rt-tree`.

### SC-UKV-674 — a partly chosen branch shows a dash

Given a branch with two leaves, one of them chosen
When the tree is drawn
Then the branch checkbox is indeterminate and not checked

Covered by the component test of `rt-tree`.

### SC-UKV-675 — without the cascade a click changes only the clicked node

Given a tree with the cascade switched off
When a person clicks a branch
Then the choice holds the branch value and none of its leaves

Covered by the component test of `rt-tree`.

### SC-UKV-676 — the single mode keeps one chosen node

Given a tree in the single mode with one leaf chosen
When a person clicks another leaf
Then the choice holds only the second leaf, and the marks are radios

Covered by the component test of `rt-tree`.

### SC-UKV-644 — the mode without marks picks a leaf

Given a tree in the mode without marks
When a person clicks a leaf
Then `picked` emits that node, no checkbox or radio is drawn, and the choice stays empty

Covered by the component test of `rt-tree`.

### SC-UKV-645 — a disabled leaf survives select-all

Given a tree with select-all shown and a disabled unchosen leaf
When a person checks select-all
Then every enabled leaf is chosen and the disabled one is not

Covered by the component test of `rt-tree`.

### SC-UKV-646 — the branches holding a chosen value are open when the tree appears

Given a chosen leaf two levels deep
When the tree is drawn
Then both of its ancestors are open, and a branch without a chosen value is folded

Covered by the component test of `rt-tree`.

### SC-UKV-647 — the search term keeps the path to a match open and marks the match

Given a folded tree whose deep leaf is labelled «Минск»
When the search term is «мин»
Then the rows of the leaf's ancestors and the leaf are shown, other rows are hidden, and «Мин» is
drawn as the matched part

Covered by the component test of `rt-tree`.

### SC-UKV-648 — the side arrows open a branch and step to its first child

Given a highlighted folded branch
When ArrowRight is passed twice to `handleKeydown`
Then the first press opens the branch and the second moves the highlight to its first child

Covered by the component test of `rt-tree`.

### SC-UKV-649 — a key the tree does not use is not consumed

Given a tree with nothing highlighted
When the letter «a» and a Space are passed to `handleKeydown`
Then both calls answer `false` and neither event is prevented

Covered by the component test of `rt-tree`.

### SC-UKV-650 — the row template is drawn at the end of every row

Given a tree with a template marked by `rtTreeNodeEnd`
When the tree is drawn
Then every visible row holds that template with its own node in the context

Covered by the component test of `rt-tree`.

### SC-UKV-651 — an empty tree names why it is empty

Given a tree with nodes and a search term that matches nothing
When the tree is drawn
Then the kit label for nothing found is shown, and with no nodes at all — the label for no options

Covered by the component test of `rt-tree`.

### SC-UKV-652 — choosing a branch leaves it as open as it was

Given a tree where a leaf of a branch is chosen, so the branch is open when the tree appears
When the branch row is clicked twice — its leaves are chosen, then cleared
Then the branch stays open after both clicks, and its children stay visible

Covered by the component test of `rt-tree`.

### SC-UKV-653 — a row's texts carry the tooltip for a cut text

Given a tree with a node that has a label and a description
When the tree is drawn
Then the label and the description each carry the kit tooltip with their own whole text, in the mode for a cut text

Covered by the component test of `rt-tree`.

### SC-UKV-665 — an exclusive click keeps only what the clicked node covers

Given a choice holding two leaves of different branches and a disabled chosen leaf
When a third leaf is clicked without Ctrl or Cmd in an exclusive tree, and then clicked again
Then the choice holds that leaf and the disabled one after the first click, and only the disabled one
after the second

Covered by the logic test of `rt-tree`.

### SC-UKV-666 — every word of the term is marked in the label, the description and the badges

Given a node «Минск» with the description «Столица» and a badge «MSQ»
When the search term is «мин сто msq»
Then «Мин», «Сто» and «MSQ» are the matched parts of the label, the description and the badge

Covered by the logic test of `rt-tree`.

### SC-UKV-668 — an exclusive tree chooses one node by a click and adds one by Ctrl or Cmd

Given an exclusive tree with checkboxes and one chosen leaf
When another leaf is clicked, and then a third one with Ctrl, and a fourth with Cmd
Then the first click leaves only the clicked leaf, and the clicks with Ctrl and Cmd add theirs to it

Covered by the component test of `rt-tree`.

### SC-UKV-669 — a group without a mark opens on a click

Given a tree with `branchMarks` off
When a group row is clicked and Space is pressed on it
Then the row has no checkbox, the group opens and folds, and the choice stays empty

Covered by the component test of `rt-tree`.

### SC-UKV-670 — a search that only marks hides no row

Given a tree with `filter` off and a search term matching one leaf
When the tree is drawn
Then every row of the tree is still shown, and the match is marked in that leaf's label

Covered by the component test of `rt-tree`.

### SC-UKV-671 — badges and the application's meta stand under the label

Given a node with two badges, a meta template and a search term matching a badge
When the tree is drawn
Then the row holds two kit tags with the match marked in one, followed by the meta template with
the node in its context

Covered by the component test of `rt-tree`.

### SC-UKV-699 — a disabled tree changes nothing in the choice

Given a disabled tree with select-all and a chosen leaf
When a person clicks a leaf, clicks select-all and presses Space
Then the choice stays as it was, and the arrow of a branch still opens it

Covered by the component test of `rt-tree`.
