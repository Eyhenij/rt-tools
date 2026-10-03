# The modes of a spinner

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the spinner of the second kit; the z-index scale
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2474 of the epic RT-2472.

## Why

The spinner of the second kit is a ring and nothing else. An application moving from the first kit
covers a block with a spinner on a translucent backdrop, puts the ring on a round plate and draws
it as a Material arc. Today each screen assembles that by hand around the ring.

## Terminology

| Term         | What it is                                                          |
| ------------ | ------------------------------------------------------------------- |
| the ring     | the turning circle of the spinner                                   |
| the overlay  | the mode in which the spinner fills its positioned parent           |
| the plate    | the round surface under the ring                                    |
| the backdrop | the translucent ground of the overlay over the parent's content     |
| the arc      | the look of the ring as a growing and shrinking arc without a track |

### What it is called in the interface

A person sees a waiting sign; how it is drawn is invisible to them.

## Rules

- **The overlay fills the positioned parent and stands the ring in its centre.** The layer comes
  from the sticky step of the scale, and `--rt-spinner-overlay-z` overrides it.
- **The plate draws a round surface under the ring.** Its size, ground and shadow are properties
  with defaults from the kit's tokens.
- **The backdrop draws a translucent ground, and only together with the overlay.**
- **The arc draws the ring as an arc without a track, in the same colour and diameter.**
- **Without the new inputs the spinner keeps its markup and draws as before.**

## What is out of scope

- Positioning the parent: the spinner does not style the node above it.
- The loading look of a button — task RT-2476.

## Contract

Not applicable: the surface is inputs of a kit component.

### Refusal codes

Not applicable.

## Data

Not applicable: the spinner keeps nothing.

## Screens and states

| State                       | What is visible                                  |
| --------------------------- | ------------------------------------------------ |
| the ring                    | the ring as before, drawn by the host            |
| the overlay                 | the ring in the centre of the parent             |
| the overlay with a backdrop | the parent's content dimmed, the ring over it    |
| the plate                   | a round surface with a shadow under the ring     |
| the arc                     | an arc turning and changing its length, no track |

## Cross-cutting requirements

### Locales

Not applicable: a spinner carries no label.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: the spinner draws the same at any width.

### Several objects

Every spinner holds its own modes: an overlay spinner and a plain one stand on one page.

## Decisions

- **The host stays the ring while no new mode is on.** The new modes draw an inner structure; the
  default markup does not change for the seven kit components that use it.
- **The overlay layer is the sticky step, not the modal one.** At the modal step an overlay over a
  block would paint over the lists and menus that open above the page.
- **The arc is a look of the same ring, not a second component.** The colour axis and the diameter
  act on it the same way.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2474.
