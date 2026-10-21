# Grill

## The owner request

> меню всегда должно быть показано в одну строку

The work of that request merged with scenario numbers another branch had already taken. The owner
was not asked again: the fix renumbers and changes no behaviour.

## What the tree already has

- The media of a card holds `SC-UKV-868` and `SC-UKV-869` on the main branch.
- The «More» item of the header held `SC-UKV-868` to `SC-UKV-873`, and both merged.
- `npm run check:specs` on the main branch names two taken identifiers.

## What the rules already say

- A scenario number is issued once and never reused. A new scenario takes the next free number.

## Questions and answers

None: the fix follows the rule.

## Decisions

- **The «More» scenarios move to `SC-UKV-870` to `SC-UKV-875`.** The card scenarios merged first,
  so their numbers stay. Rejected: moving the card scenarios, because their merge came earlier.

## What is left unclear

- Nothing.
