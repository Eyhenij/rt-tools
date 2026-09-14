# Text that does not fit its place

**Status:** in force · **Revision:** 14 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The subdomain names what a kit component does with text longer than the place it is drawn in, so
that a value the consumer cannot shorten does not silently land on a neighbour.

## Why

A value the component did not invent arrives from the consumer, and its length is not the kit's to
choose. A file name of sixty characters, a hint of four words, a label in a locale where the same
phrase is half again as long — each is ordinary, and each is longer than the sample value the
component was laid out with.

Text that has no declared fate does one of two things, and both are silent. It wraps and grows its
line, and a neighbour laid out in the same row lands on top of it. Or it keeps one line and grows
the whole component past the place it was given, and then the component covers whatever stands
next to it.

The cost has already been paid twice in one family. The card of a file grew to 613 points inside a
place of 272 and slid off the left edge of the page; the size badge landed on the second line of
the wrapped name, and neither could be read. The hint over the area of dropping measured 84 points
inside a box of 66 and stuck out past the top and the bottom border at once. Neither the build,
nor the linter, nor a component test sees any of this: the markup holds the whole text, and the
clipping is the browser's.

## Terminology

| Term           | What it is                                                                               |
| -------------- | ---------------------------------------------------------------------------------------- |
| the place      | the box the consumer gives the component — a grid cell, a column, a pane                 |
| the own box    | the rectangle of the component's own host element                                        |
| the fate       | what happens to the part that does not fit: an ellipsis, a wrap, a compact form          |
| the long value | the longest value the component can get from a real consumer, not the one in the example |

### What it is called in the interface

Not applicable: the agreement is about how a value is drawn, and it adds no word to a screen.

## Rules

- **A text of the kit that can be longer than its place declares what happens to what does not
  fit.** Undeclared, the text keeps its full width, and the component grows with it; the consumer
  cannot fix that from outside.

- **A component takes the width its place gives and does not grow past it.** In a grid the
  neighbour is another instance of the same component, and the reader sees two of them through one
  another.

- **A component never paints outside its own box.** What lies outside the host belongs to whoever
  drew it there, and the consumer's layout has nothing to hold it with.

- **A hint the kit writes itself fits the box it is drawn in, or it is drawn in a compact form.**
  A hint clipped midword is worse than a smaller one: the reader does not know a word was taken
  away.

- **A component is shown on the long value, not on the sample one.** All three misses above are
  invisible on a short value, and a showing laid out on the sample value is green through them.

## What is out of scope

- **Where the place itself comes from.** A component left without a size by the markup of a showing
  is the neighbouring case, and the side panel holds it in its own subdomain.
- **The wording of the kit's labels.** The label set lives in the `rtKit` namespace, and this
  agreement says nothing about which words stand there.

## Contract

Not applicable: the agreement adds no procedure.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing of this reaches a storage.

## Screens and states

Not applicable: the agreement is about components, and the showcase pages of both families show
them.

## Cross-cutting requirements

### Locales

The kit's own hints live in the `rtKit` namespace in eight languages, and the same phrase differs
in length between them by half. A hint that fits the box in one language is therefore not a
statement about the rest: the compact form is what answers for them.

### SEO

Not applicable.

### Mobile layout

A narrow screen is the same case as a narrow place, and the same rules answer it.

### Several objects

Not applicable.

## Decisions

- **The name of a file is one line with an ellipsis, not a wrap.** Rejected: wrapping to two lines
  — the card is a row, and a grown line pushes the size badge onto the text. The title of the card
  already ends with an ellipsis.
- **The hint over the area of dropping shrinks rather than clips.** Rejected: clipping at the box
  border — a hint cut midword reads as a defect of the application. The clipping stays as a
  backstop under the shrinking: without it the promise about the own box would hold by arithmetic
  alone.
- **The compact form is chosen by a query about the size of the box, and the container sign stands
  on the overlay.** Rejected: the sign on the host of the component — its height comes from what
  the consumer projected into it, and containment on both axes would collapse it to nothing.
  Rejected: a measurement of the box in code — a second answer to a question the browser already
  answers. The price of the chosen option is that the room between the frame and the edge of the
  overlay had to move from a padding of the overlay onto the frame itself: a query does not reach
  the box of its own container.

## Open questions

None: `Q-1` closed with the third decision above.

## History of changes

- 14 September 2026 — the agreement is written from the owner's report about the showings of the
  file card and the area of dropping.
