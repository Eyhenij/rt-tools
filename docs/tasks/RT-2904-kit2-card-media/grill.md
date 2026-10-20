# Grill

## The owner request

The cards of a services screen carry the mark of the service in the top left corner, with the
title and the description under it. The owner approved such a card in the design mockups and
chose «Влил, выпускай сам (Рекомендую)» when asked how the kit is released for the marks.

## What the tree already has

- `rt-card` draws the title from the `header` input first and the `[rtCardHeader]` slot after it.
  Nothing can stand above the title.
- `rt-service-logo` draws the mark itself; the card only has to give it a place.

## What the rules already say

- The ready-made is extended where it lives, not cloned next to it: rule `reuse-first`.
- A changed kit part comes with its spec, unit spec and story.

## Decisions

- **A slot of its own above the header, `[rtCardMedia]`.** Rejected: moving `[rtCardHeader]` above
  the title — every card that puts actions next to its title would change its look.
- **An empty slot takes no room.** Cards without a mark look as before.
