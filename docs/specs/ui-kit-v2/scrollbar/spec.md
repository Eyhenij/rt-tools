# The bar of the scroll

**Status:** in force · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`
**Procedures:** none

The subdomain names what the bar of the scroll at the zones of the kit looks like and when it is
visible.

## Why

The bar of the scroll is visible always: at every scrollable zone on the screen there stands a grey
stick, even when nobody is looking at it. On a screen with a table, a panel and a list there are three
such sticks, and all of them argue for the attention with the content.

Hiding it whole is not allowed: the only sign that a zone scrolls at all disappears, and so does the
only pointer to where a person is inside it.

The property the bar was laid over the content by is removed from the browsers. The techniques that
replace it show the bar together with its place — and the content jerks sideways at every hovering.

## Terminology

| Term                 | What it is                                                                         |
| -------------------- | ---------------------------------------------------------------------------------- |
| a zone of the scroll | an element whose content is longer than itself                                     |
| a quiet bar          | a bar whose place is taken and whose slider is invisible until the zone is hovered |

### What it is called in the interface

| In the agreement | On the screen                                                    |
| ---------------- | ---------------------------------------------------------------- |
| a quiet bar      | an empty track along the edge of the zone                        |
| shown            | the slider in the colour of a border, stronger under the pointer |

## Rules

- **The place under the bar is taken always, and only the slider becomes visible.** A technique showing
  the bar together with its place moves the content sideways at every hovering — and on a screen with a
  list inside a panel that is noticeable twice within one movement of the mouse.
- **The slider is shown at a hovering over the zone, not over the slider itself.** There is nothing to
  hover over what is invisible: hovering over the slider is good only when it is already visible.
- **A focus inside the zone shows the bar on a par with a hovering.** The scroll from the keyboard goes
  without a pointer, and a person otherwise sees neither where they are in the list nor that the list
  scrolls at all.
- **Where there is no hovering, the bar is visible always.** On a touch screen there is no hovering at
  all, and a quiet bar would stay invisible forever.
- **The standard properties of the bar are declared next to the pseudo-elements.** One branch of the
  browsers understands the ones, another the others; written apart, they diverge in look, and half of
  the readers see the bar of the system instead of the one of the kit.
- **The colour of the slider is taken by the token of a border, not by a value of its own.** The bar is
  a part of the same line of the boundaries as the borders of the fields; a value of its own would
  diverge from them at the first edit of the theme.

## What is out of scope

- A bar of one's own by markup instead of the one of the system: it stops obeying the wheel, the keys
  and the gestures, and that has to be cured in the code of every zone.
- The hiding of the bar at separate components: where the bar must not be at all, the component says so
  by a rule of its own.

## Contract

Not applicable: the surface is the layer of the design, the subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State                      | What is visible                                             |
| -------------------------- | ----------------------------------------------------------- |
| rest                       | the place under the bar is taken, the slider is not visible |
| a hovering over the zone   | the slider in the colour of a border                        |
| a hovering over the slider | the slider stronger and thicker                             |
| a focus inside the zone    | the same as at a hovering                                   |
| a touch screen             | the slider is visible always                                |

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

The slider is visible always: there is no hovering on a touch screen.

### Several objects

Not applicable.

## Decisions

- **The place under the bar stays taken** — otherwise the content jerks sideways at every hovering.
  Rejected: showing the bar together with its place, as the techniques that were found do.
- **The bar stays the one of the system and is designed by rules** — a bar of one's own by markup stops
  obeying the wheel, the keys and the gestures. Rejected: a foreign library of a bar of the scroll.

## Open questions

- `Q-4` — whether the first kit needs the same quiet bar: it has a layout of the styles of its own and a
  set of tokens of its own. The work goes with the assumption that the second kit closes the request
  whole.

## History of changes

- 31 August 2026 — the subdomain was created: the quiet bar, the showing at a hovering and at a focus.
