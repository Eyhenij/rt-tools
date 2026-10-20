# Grill

## The owner request

> Делай RT-2861

The third task of epic RT-2861. The task body (#2870): `rt-select` and `rt-multiselect` each
declare `OPEN_KEYS`, `activeIndex`, `activeOptionId` and `#moveActive`, and their keyboard parts
differ by 17 lines out of about a hundred. `rt-autocomplete` writes the same a third time. An
accessibility fix made in one field does not reach the others. One option-list controller is
needed — the active option, the opening keys, the id for `aria-activedescendant`, the scroll to
the option — with a spec of its own, and these three fields move onto it first.

## What the tree already has

- The select and the multiselect open by ArrowDown, ArrowUp, Enter and Space; Enter and Space
  choose; Escape closes; the side arrows work the tree; the arrows wrap and skip disabled rows.
- The autocomplete opens by typing, not by keys; Enter chooses, Space types; its arrows wrap and
  know no disabled rows.
- The select puts the highlight on the chosen option when the list opens; the multiselect does not.
- Each field computes the option id as `<panel id>-opt-<index>` and calls
  `rtScrollActiveOptionIntoView`.

## Questions and answers

The owner named the epic, and its plan answers the questions of this task.

- **Behaviour changes?** No: the epic plan says the present keyboard tests of the three fields stay
  green.
- **Where does the controller live?** In `src/lib/options`, next to the scroll helper it calls,
  published by `core`.
- **What stays in each field?** What differs: which keys choose, whether the side arrows work a
  tree, where the highlight lands on opening.
- **Done sign:** the three fields declare no `OPEN_KEYS`, `#moveActive` or option id of their own;
  the controller's tests check the keys without drawing a component.
- **Not part of it:** the arrows in the dynamic selector and the tree selector (RT-2871); `rt-menu`
  and `rt-tree`.
