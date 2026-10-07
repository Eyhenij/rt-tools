# Scenarios — a hybrid choice by a tree

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-691 — a single group keeps one leaf

Given a single group «This Year» with the leaves «Revenue» and «Rooms», and «Revenue» chosen
When a person clicks «Rooms»
Then «Rooms» is chosen, «Revenue» is not, and the choice outside the group stays

Covered by the logic test and the component test of `rt-hybrid-tree`.

### SC-UKV-692 — a click on the chosen single leaf clears it

Given «Rooms» chosen in a single group
When a person clicks «Rooms»
Then nothing in the group is chosen

Covered by the logic test of `rt-hybrid-tree`.

### SC-UKV-693 — the group radio clears the group or chooses its first leaf

Given a single group with nothing chosen
When a person clicks the group radio
Then its first enabled leaf is chosen, and a second click clears the group

Covered by the logic test and the component test of `rt-hybrid-tree`.

### SC-UKV-694 — select-all skips the single leaves

Given a tree with a free group and a single group
When a person ticks «Select all»
Then every free leaf is chosen and the single group stays as it was; unticking clears both

Covered by the logic test and the component test of `rt-hybrid-tree`.

### SC-UKV-695 — the cascade of a branch skips the single leaves

Given a branch holding a free group and a single group
When a person ticks the branch
Then the free leaves are chosen and the single leaves are not

Covered by the logic test of `rt-hybrid-tree`.

### SC-UKV-696 — the exclusive click on a single leaf keeps the rest

Given an exclusive tree with a free leaf chosen
When a person clicks a single leaf without Ctrl or Cmd
Then the single leaf is chosen and the free leaf stays

Covered by the logic test of `rt-hybrid-tree`.

### SC-UKV-697 — a group without a mark shows its count

Given a tree with group marks off and two leaves chosen under «This Year»
When it is drawn
Then the row «This Year» ends with «2», and a group with nothing chosen shows no count

Covered by the component test of `rt-hybrid-tree`.

### SC-UKV-698 — the hybrid selector applies a single group through its draft

Given the confirming hybrid selector with «Revenue» chosen in a single group
When a person clicks «Rooms» and presses «Apply»
Then the choice holds «Rooms» and not «Revenue»

Covered by the component test of `rt-hybrid-tree-selector`.
