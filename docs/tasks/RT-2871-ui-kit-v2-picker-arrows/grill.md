# Grill

## The owner request

> Делай RT-2861

The fourth task of epic RT-2861. The task body (#2871): `rt-dynamic-selector` and
`rt-tree-selector` have no arrow keys; a person at the keyboard cannot pick an option in them.
Both fields take the option-list controller of the previous task. The epic plan adds: the arrows,
Home, End, Enter and Escape work as in the select, with keyboard tests and a check in the browser
on the showcase.

## What the tree already has

- The dynamic selector popup: the search field, then checkboxes or radio buttons, one per row.
  Tab walks the rows; Space ticks a checkbox; no arrow moves between rows. Escape closes the
  popover, and the popover drops the ticks.
- The tree selector passes every key of its search field to `rt-tree`. The tree moves its
  highlight by the arrows, opens branches by the side arrows, chooses by Space and Enter. So the
  arrows already work there; Home and End do not.
- No field of the kit knows Home and End: the select and the multiselect neither.
- The rows of the dynamic popup are native controls with their own roles. A listbox named by
  `aria-activedescendant` cannot hold them.

## Questions and answers

The owner named the epic, and its plan answers the questions of this task. Two points the plan
does not settle are decided here and named in the PR.

- **Behaviour changes?** Yes: new keys in five fields.
- **How does the dynamic popup move between rows?** The focus moves to the control of the row:
  the rows are checkboxes and radio buttons, and Space already ticks them natively. The
  controller gives the index of the next row; the popup focuses it.
- **Home and End in a text field?** In the autocomplete and in the search field of the dynamic
  popup they stay with the caret. In the tree and the tree selector they move the highlight only
  while a row is highlighted, so the caret keeps them before the first arrow.
- **Done sign:** the arrows, Home, End and Enter work in the dynamic popup and Home and End in the
  select, the multiselect and the tree; tests per key; a check in the browser on the showcase.
- **Not part of it:** the pass-through inputs of the dynamic selector (RT-2872); the wrap of the
  arrows in the tree: it stops at the ends, as before.
