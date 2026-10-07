# Scenarios — a choice by a tree with search

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-677 — the search keeps the nodes with every word and opens the kept branches

Given a tree whose leaves are «Paris Hilton», «Paris Ritz» and «Berlin Hilton» under two branches
When a person types «hilton paris» into the search field
Then only «Paris Hilton» and its branch are left, the branch is open, and both words are marked

Covered by the logic test and the component test of `rt-tree-selector`.

### SC-UKV-678 — a branch that matches keeps its whole subtree

Given a branch «Paris» with two leaves that do not contain the word
When a person types «paris»
Then the branch and both leaves are left

Covered by the logic test of `rt-tree-selector`.

### SC-UKV-679 — the search field hands the arrows and Enter to the tree

Given the selector with the focus in the search field
When a person presses ArrowDown and then Space
Then the first row is highlighted and chosen, and the text of the field is unchanged

Covered by the component test of `rt-tree-selector`.

### SC-UKV-680 — in the direct form a click writes the choice at once

Given the selector without the confirming form
When a person clicks an unchosen leaf
Then `value` holds that leaf

Covered by the component test of `rt-tree-selector`.

### SC-UKV-681 — in the confirming form «Apply» writes the draft and «Cancel» drops it

Given the selector in the confirming form with one leaf chosen
When a person clicks a second leaf and presses «Cancel», then clicks it again and presses «Apply»
Then after «Cancel» `value` holds one leaf and `cancelled` is emitted; after «Apply» it holds both and
`applied` is emitted with them

Covered by the component test of `rt-tree-selector`.

### SC-UKV-682 — «Apply» is off while nothing changed and while an empty draft is not allowed

Given the selector in the confirming form with empty choice not allowed
When nothing is changed, then the only chosen leaf is cleared, then another leaf is chosen
Then «Apply» is off, off again, then on; `canApply` says the same

Covered by the logic test and the component test of `rt-tree-selector`.

### SC-UKV-683 — clear keeps the disabled chosen nodes

Given a choice of one enabled and one disabled leaf
When a person presses «Clear selection»
Then the choice holds only the disabled leaf

Covered by the logic test of `rt-tree-selector`.

### SC-UKV-684 — with the multi toggle off a plain click keeps one node

Given the selector with the multi toggle drawn and off, and one leaf chosen
When a person clicks another leaf, then switches the toggle on and clicks a third
Then after the first click only the second leaf is chosen, after the toggle both the second and the
third are

Covered by the component test of `rt-tree-selector`.

### SC-UKV-685 — Enter in the single confirming form applies a new node and cancels the same one

Given the selector in the single mode and the confirming form with one node chosen
When a person highlights another node and presses Enter, and in a second selector presses Enter on
the node already chosen
Then the first emits `applied` with the new node, the second emits `cancelled`

Covered by the component test of `rt-tree-selector`.

### SC-UKV-686 — the application's controls stand at the right end of the row

Given the selector with a template marked by `rtTreeSelectorControls`
When it is drawn
Then the template stands at the right end of the controls row, after the selector's own buttons

Covered by the component test of `rt-tree-selector`.

### SC-UKV-689 — expand-all and collapse-all are icon buttons drawn only when asked for

Given the selector without `expandControls`
When it is drawn
Then the controls row holds neither «Expand all» nor «Collapse all»; with `expandControls` both
stand as icon buttons with their labels as names and tooltips

Covered by the component test of `rt-tree-selector`.

### SC-UKV-690 — revert returns the draft to the choice

Given the confirming form with `revertable` and the choice «Paris Hilton»
When a person ticks «Berlin Hilton» and presses «Revert selection»
Then the draft is «Paris Hilton» again, the selector stays open, and the button is off while the
draft equals the choice; in the direct form the button is not drawn

Covered by the component test of `rt-tree-selector`.

### SC-UKV-700 — a disabled selector changes nothing in the choice

Given a disabled confirming selector with clear, revert and the expand buttons
When it is drawn and a person clicks a row
Then the search field and every button are off, the choice stays, and `canApply` is false

Covered by the component test of `rt-tree-selector`.
