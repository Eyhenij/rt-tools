# Grill

## The owner request

> блики по тексту идут слишком быстро, сделай это медленнее, и сделай блики разноцветними а не толкьо синими

## What the tree already has

`rt-ai-run-status` runs a gradient from the muted text to the primary action colour; one pass is
`--rt-duration-slower`, 500 ms. The palette of the kit has blue, light blue, green, amber, red; no
violet or pink.

## Questions and answers

None asked: the request names both changes.

## Assumptions

- **Blue, light blue, green, amber** — the hues the palette has; red reads as an error. Cancelled:
  new primitives in the palette if the owner wants violet and pink.
- **2.4 s a pass** — about five times slower. Cancelled: one value of the block property.

## Decisions

- **Colours and the pass are block properties** — `--rt-ai-run-status-shimmer-to` and
  `-shimmer-2…4`, `-shimmer-duration`. Rejected: a fixed gradient without properties.
