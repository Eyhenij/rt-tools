# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 10–13: an overlay mode that covers the parent and centres the ring, a round
plate under the ring, a translucent backdrop and an arc look without a track, as in Material.

## What the tree already has

- `rt-spinner` draws the ring by its own host: a border with one coloured side and a rotation.
  There is no template at all.
- Seven kit components put `rt-spinner` in their markup with the default look, and none of them
  styles its block class from outside.
- The z-index scale holds `sticky` 1100, `modal` 1400, `popover` 1500 and others.

## Decisions

- **The host stays the ring while no new mode is on** — the default markup and frames do not move.
  The new modes draw an inner structure. Rejected: an inner ring for every spinner — the seven
  consumers would get a different markup for nothing.
- **The overlay takes its layer from the sticky step, not the modal one** — the consumer asked for
  `--rt-z-modal`. An overlay over a block at the modal step would paint over the menus and lists
  that open above the page. The sticky step covers the block's own sticky parts and stays under
  every overlay of the page. The property `--rt-spinner-overlay-z` overrides it.
- **The backdrop works only together with the overlay** — without the overlay the spinner has no
  box to fill.
- **The arc keeps the colour axis and the diameter** — it is a second look of the same ring, not a
  second component.
