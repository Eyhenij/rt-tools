# The card stack

**Status:** in force · **Revision:** 10 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the kit scales and the material preset
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about `rt-carousel`, written by task RT-2556 of the epic RT-2542,
which moves the applications' shared parts into the kit.

## Why

An application that installs the second kit shows the roles and the permissions of a record in a
table cell as a stack of small coloured cards. The cards overlap to fit a narrow cell, and a card
under the pointer opens to its whole label. The application draws the stack itself: no key reaches a
card, so a keyboard user never reads a whole label. The kit has no such part.

## Terminology

- **A card** — one coloured plate of the stack with a short label.
- **The tone** — whether the label of a card is drawn dark or light, chosen by the brightness of the
  card colour.
- **An open card** — a card under the pointer or in focus: raised, as wide as its label, above its
  neighbours.

### What it is called in the interface

| In the domain | On the screen                                                       |
| ------------- | ------------------------------------------------------------------- |
| The stack     | a row of overlapping coloured cards                                 |
| A card        | a plate of its colour with the label cut by an ellipsis             |
| An open card  | the card raised and widened to the whole label, the next ones aside |

## Rules

- **The stack draws the cards of its input in their order, each card overlapping its left neighbour,
  and an empty input draws no card.**
- **A card is filled with its colour, `#rgb` or `#rrggbb`; a card without a colour or with any
  other value keeps the kit ground and the kit text colour.**
- **The label of a coloured card takes the dark tone on a light colour and the light tone on a dark
  one, by the brightness rule of the application.** The brightness is
  `0.299 · red + 0.587 · green + 0.114 · blue`, and above 186 the label is dark.
- **The pointer and the focus open a card: it rises, grows to its whole label and comes on top, and
  the cards after it move aside.** Every card is in the Tab order, so the keyboard opens every label;
  with reduced motion the cards move without a transition.
- **The host keeps the width of the closed stack, and an open card goes past it on top.** A table
  cell sized by its content does not stretch under the pointer.
- **Every size, overlap, lift, shift, radius, shadow, type step, label case and duration of the
  stack is a `--rt-carousel-*` property, and without them the stack draws the kit look.**
- **The material preset draws the application's look by the same properties, without Material
  packages: cards with small corners and a large shadow, a dark label in the Material text colour,
  a regular-weight label in title case, and a slower move.**
- **The labelCase input writes every word of a label with a capital and the rest in lower case;
  by default the label stays as given.**

## What is out of scope

- A scrolling carousel with arrows and swipe: the application has no such part.
- Placing the stack in a table cell: that is the application's layout.
- Changing the label text itself: the material look capitalises the words by a style.

## Contract

None: the part draws its input and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the cards arrive by the input.

## Screens and states

| state                 | what is drawn                                            |
| --------------------- | -------------------------------------------------------- |
| no cards              | nothing                                                  |
| cards                 | the overlapping row, each card of its colour, labels cut |
| a card without colour | the card on the kit ground with the kit text colour      |
| an open card          | the card raised and widened, the next cards moved aside  |
| focus                 | the open card with the kit focus ring                    |

## Cross-cutting requirements

### Locales

The labels arrive from the application already translated; the stack adds no text of its own.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

A tap focuses a card and opens it the same way the pointer does; a tap elsewhere closes it.

### Several objects

Every stack is independent; several stand side by side in a table column.

## Decisions

- **The stack is a list of focusable cards, not buttons.** A card does nothing on a press: it only
  opens to show its label, so focus is the way to reach it and no action is promised.
- **The tone is two fixed neutral steps, not a computed colour.** A card keeps its contrast in the
  dark theme as well.
- **The label case is a style property, and the application's title case is an input.** The
  material look capitalises the first letter by a property; lowering the rest of a word ("AI" to
  "Ai") is not a style, so it comes behind `labelCase="title"`, which keeps the text as given by
  default.
- **The light label weight stays with the property.** The application's label is 300 and the kit
  scale has no such step; the application sets `--rt-carousel-label-weight` itself.

## Open questions

- Whether the scrolling carousel of the task card is wanted as a part of its own — named to the
  owner.

## History of changes

- 9 October 2026 — written by the task RT-2556 of the epic RT-2542.
- 10 October 2026 — after a comparison with the application, the material preset takes its dark
  label colour. The live application draws the large kit shadow on its cards, so the shadow stays.
- 12 October 2026 — the host keeps the width of the closed stack, and the labelCase input gives the
  application's title case.
