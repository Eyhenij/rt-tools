# The colour palette

**Status:** in force · **Revision:** 9 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the form field base, the floating panel, the text field and the buttons of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about `rt-color-palette`, written by task RT-2555 of the epic RT-2542,
which moves the applications' shared parts into the kit.

## Why

An application that installs the second kit picks the colour of a role and of a season from a set of
swatches, with its own colour when the set lacks one. It draws the field with a third-party colour
package: the swatches have no names for a screen reader and no arrows, and the field has no
disabled look. The kit has no such part, and a third-party package does not go into it.

## Terminology

- **A swatch** — one round button of the palette, filled with its colour.
- **The custom colour** — a colour the person picked outside the set.
- **The picker** — the panel where the custom colour is picked: the area, the hue strip and the hex
  field.

### What it is called in the interface

| In the domain     | On the screen                                                    |
| ----------------- | ---------------------------------------------------------------- |
| The chosen colour | the swatch with a ring around it                                 |
| The custom colour | one more swatch after the set, and a button to pick or edit it   |
| The picker        | a panel with a colour area, a hue strip, a hex field and buttons |
| Read only         | one swatch of the current colour                                 |

## Rules

- **The value is a colour `#rrggbb` in lower case; anything else written into the field reads as no
  colour.** A three-digit hex is spread to six, the case is lowered, a missing hash is added.
- **The swatches draw the given colours in their order, or the kit's eighteen when none are given,
  and a value outside them is drawn as one more swatch after them.**
- **A press on a swatch chooses its colour, and the field reports the change and the touch.**
- **The swatches are a radio group: one swatch is in the Tab order, the arrows choose the next and
  the previous, Home and End the ends.** Every swatch is named by its hex.
- **Read only draws one swatch of the current colour and nothing to press.**
- **A disabled field draws muted swatches and takes no press and no key.**
- **The picker opens from the custom colour button, starts from the current colour, and only Apply
  writes the picked colour into the field.** Cancel, Escape and a press outside close it without a
  change; Apply waits for a colour that differs from the current one.
- **In the picker the area takes saturation and brightness and the strip takes the hue, by the
  pointer and by the arrows; the hex field takes a typed colour once it is a full hex.**
- **The channels input adds red, green and blue fields under the hex field; each shows its channel
  and takes a typed whole number from 0 to 255.** Without the input the picker has no such row.
- **Every size, gap, ring, border and radius of the palette and the picker is a
  `--rt-color-palette-*` property, and without them the palette draws the kit look.**
- **The material preset draws the application's look by the same properties, without Material
  packages: borderless swatches of 30 points with gaps of 10, a hollow ring on the chosen one, and a
  swatch that grows under the pointer.** The custom swatch is the last in the grid, and its grey
  button stands 16 points below the grid. An empty read-only value is a white circle. The picker is
  256 by 320 points with a dense grey shadow.

## What is out of scope

- An alpha channel: the application keeps none.
- HSL fields: the application's picker has none.
- The application's theme list: it belongs to the application and arrives by the colours input.

## Contract

None: the part is a form control and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the value lives in the consumer's form.

## Screens and states

| state            | what is drawn                                                    |
| ---------------- | ---------------------------------------------------------------- |
| no colour        | the swatches, none ringed                                        |
| chosen           | the chosen swatch ringed                                         |
| custom           | one more swatch after the set, ringed, and «Edit custom colour»  |
| picker open      | the panel under the button, Apply muted until a change           |
| read only        | one swatch of the current colour; empty — a swatch with a border |
| disabled         | muted swatches and a muted button                                |
| invalid, touched | the swatches as they are; the error is drawn by `rt-field`       |

## Cross-cutting requirements

### Locales

The labels — the group name, «Custom colour», «Edit custom colour», the area and the strip names,
Cancel and Apply — are kit labels, English in the package and translated by the consumer's
translator. A swatch is named by its hex, which needs no translation.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The swatches wrap by the width of the field; the picker moves to the opposite side at the edge of
the screen and is dragged by the finger as by the mouse.

### Several objects

Every palette holds its own picker; opening one closes another only by the press outside.

## Decisions

- **The picker is the kit's own panel on the floating panel, not a third-party picker.** The area
  and the strip are drawn by gradients and moved by the pointer and the arrows; the colour maths is
  a pure module.
- **The swatches are named by their hex and move by the arrows.** The application's swatches took
  Enter only and had no names.
- **The kit's default list is the eighteen colours of the application's default list.** A neutral
  set of the main hues; a theme list is the application's own.

## Open questions

None.

## History of changes

- 9 October 2026 — written by the task RT-2555 of the epic RT-2542.
- 10 October 2026 — after a live comparison with the application, the material preset moves the
  custom swatch onto the row of its button and draws the picker at the application's size and
  shadow.
- 12 October 2026 — at the owner's word the custom swatch goes back into the grid in the material
  look; the picker gets the channels input with red, green and blue fields, and the material look
  draws an empty read-only value as a white circle.
