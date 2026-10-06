# Scenarios — a tree of choice

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-639 — a click on a leaf adds it to the choice and leaves the nodes as they were

Given a tree in the multiple mode with the cascade
When a person clicks an unchosen leaf
Then `value` gets a new array holding that leaf, and the node objects passed in are unchanged

Covered by the component test of `rt-tree`.

### SC-UKV-640 — a click on a branch chooses its enabled leaves and then clears them

Given a branch whose leaves are all enabled and none chosen
When a person clicks the branch twice
Then after the first click every leaf of the branch is in the choice, and after the second none is

Covered by the component test of `rt-tree`.

### SC-UKV-641 — a partly chosen branch shows a dash

Given a branch with two leaves, one of them chosen
When the tree is drawn
Then the branch checkbox is indeterminate and not checked

Covered by the component test of `rt-tree`.

### SC-UKV-642 — without the cascade a click changes only the clicked node

Given a tree with the cascade switched off
When a person clicks a branch
Then the choice holds the branch value and none of its leaves

Covered by the component test of `rt-tree`.

### SC-UKV-643 — the single mode keeps one chosen node

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
