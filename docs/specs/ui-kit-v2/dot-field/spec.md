# The dot field

**Status:** in force · **Revision:** 6 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the design of the kit — the colour of the dots comes from its appointments
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2565.

## Why

A page with one card in the middle — sign-in, an error, a maintenance notice — stands on an empty
background, and the card hangs in a void. An application that wants a living background draws its
own canvas: the grid, the noise, the theme colour, the stop for reduced motion. The kit has nothing
for this; `rt-ripple` is the wave of a press and draws no background.

## Terminology

| Term         | What it is                                                              |
| ------------ | ----------------------------------------------------------------------- |
| the field    | the canvas that fills its positioned parent behind the content          |
| a cell       | one square of the 10px grid; a dot is drawn in its centre or not at all |
| a frame      | one drawing of every cell; the next frame moves the noise a step        |
| the clearing | the centre of the field, where the dots thin out behind the content     |

### What it is called in the interface

| In the agreement | On the screen                       |
| ---------------- | ----------------------------------- |
| the field        | the background of small square dots |
| a frame          | the clouds of dots drift slowly     |
| the clearing     | fewer dots right behind the card    |

## Rules

- **The field fills its positioned parent and stays behind the content.** It takes no presses and is
  hidden from the assistive means.
- **A cell is lit where the moving noise passes a threshold that a 4x4 Bayer matrix breaks per
  cell.** The clouds get ragged edges instead of smooth ones.
- **The dots thin out in the clearing.** The content in the centre stays readable in both themes.
- **The colour of the dots is the computed `color` of the field, read on every frame.** The dots
  follow the theme without code.
- **A frame is drawn every 90ms, not on every animation frame.** The stepped movement is part of the
  look.
- **With `prefers-reduced-motion: reduce` one frame is drawn and no other is planned.**
- **The drawing starts after the first render in the browser and stops when the field leaves the
  page.** Nothing is drawn on the server.
- **A canvas without a 2D context draws nothing and plans nothing.**
- **The field follows the size of its parent and the density of the screen's points.**
- **The styles of the field live in the cascade layer of the kit's components.**

## What is out of scope

- **Inputs for the grid, the speed or the threshold.** Nobody asked for them; the look is one.
- **A background gradient or a glass card.** They belong to the page that puts the field behind its
  content.
- **Publishing a version of the package.** A separate manual run after the merge.

## Contract

Not applicable: the surface is a component of the kit without inputs and outputs. The colour is set
by the CSS `color` of the host.

### Refusal codes

Not applicable.

## Data

Not applicable: the field keeps only the time of the noise and the size of the canvas.

## Screens and states

| State          | What is visible                                     |
| -------------- | --------------------------------------------------- |
| moving         | clouds of dots drift slowly around a thinner centre |
| reduced motion | one still frame of the same clouds                  |
| dark theme     | the same clouds in the colour of the dark theme     |

The showcase gets `Playground` with a card in the centre over the field, `Presets` and `Themes`. The movement
is not shot: the snapshot shows a still frame.

## Cross-cutting requirements

### Locales

The field holds no text.

### SEO

Nothing: the canvas is empty on the server and hidden from the assistive means.

### Mobile layout

The field takes the size of its parent at any width.

### Several objects

Several fields on one page draw each its own canvas and stop each with its own page.

## Decisions

- **The family is named `rt-dot-field`.** Rejected: `rt-ripple-background` — the kit already has
  `rt-ripple` for another thing.
- **The decision which cell is lit lives in pure functions next to the component.** It is checked
  by a call, and the drawing stays a thin loop over the cells.
- **The colour comes from CSS, not from an input.** The theme switches the appointment, and the
  computed value is the only colour the canvas accepts.

## Open questions

None.

## History of changes

- 6 October 2026 — the agreement was written by the grilling of the owner's request, task RT-2565.
