# The tag of the second kit

**Status:** in force · **Revision:** 2026-09-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/overflowing-text`
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about the pill with a label: what it says, by what it is painted, what
it does with a label that does not fit and what it gives outward.

## Why

The tag is the kit's answer to a whole family of small pills — a status, a counter, a label, a
marker of a kind. A consumer who starts a pill of their own next to it gets a second shape of one
thing on one screen, and nobody sees that but the reader. The subdomain names what the tag already
promises, so that the next pill is asked for from it rather than written beside it.

## Terminology

| Term           | What it is                                                                      |
| -------------- | ------------------------------------------------------------------------------- |
| The pill       | The root of the tag's markup: the label, the icons and the cross inside one box |
| The palette    | The closed set of meanings the pill is painted by: a state, not a colour        |
| The shape      | Whether the pill is fully rounded or a square with a small rounding             |
| The appearance | Whether the pill is filled or drawn by an outline alone                         |
| The size       | The step of the padding, the type size and the icon of the pill                 |
| The cross      | The button at the right edge; it reports a press and removes nothing            |

### What it is called in the interface

| In the domain | On the screen                                                           |
| ------------- | ----------------------------------------------------------------------- |
| The pill      | a small rounded plate with a word inside it                             |
| The palette   | the colour of the plate and of the word in it: green, red, yellow, grey |
| The size      | how much room the plate takes next to the text around it                |
| The cross     | a small cross at the right edge of the plate                            |

## Rules

- **A tag without a label does not exist, and the label arrives by a required input.** An icon
  without a word is a button with an icon, not a tag: it says nothing to a reader and nothing to a
  search over the page.
- **The palette is a closed set of meanings, and the default is the neutral one.** A colour arrives
  by the meaning — a state — and not as a value: a consumer who paints a pill by a colour of their
  own puts a meaning on the screen that the rest of the kit does not carry. What the consumer needs
  their own colour for is answered by overriding the component's own property.
- **The palette is doubled by an attribute of the markup.** A check and a style from outside find
  the pill by it without leaning on a class of the block: a BEM class changes together with the
  layout, and the attribute says the meaning.
- **The shape sets the rounding, and a rounding named apart beats the shape.** They are sorted out
  by the order of the rules in the file rather than by specificity: an explicit rounding stands
  below and wins. A consumer who named neither gets the rounding of the shape.
- **The outlined appearance is declared below every palette.** A palette sets a background, and an
  appearance declared above it would be overridden by that background silently — the pill would
  stay filled while the markup asks for an outline.
- **An icon stands on either side of the label, and both sides live together.** Neither is a
  default: a tag that shows an icon nobody asked for takes room in a row of pills where every pixel
  of width is counted.
- **The cross does not close the tag: it reports a press.** The component keeps no state, and
  removing the pill from a list belongs to whoever holds the list. Otherwise a pill vanishes from
  the screen while the record behind it stays.
- **A press on the cross does not travel up.** A whole pill is often clickable itself, and without
  that one press would fire twice.
- **The label of the cross comes from the dictionary of the kit.** It is the only thing a reader is
  told about that button, and a key instead of a word says nothing to a person.
- **The size is chosen by a step, not by a number in the place.** Three steps: the padding, the type
  size and the icon of the pill move together. A consumer who sets a type size of their own gets a
  pill whose padding stays from another step, and the row of pills stops lining up.
- **A label that did not fit its place is cut by an ellipsis and gets a hint with the whole value.**
  A pill lives in a row, in a cell and in a header, and the value inside it comes from a consumer
  who cannot shorten it. Cut without a hint, the text reads as the whole one: a person has no way to
  learn where it actually ends. The hint is the ready-made one of the kit; a hint of one's own would
  diverge from the neighbouring one in look, place and time of showing.
- **The overflow is counted by watching the size of the box, not by a countdown after the drawing.**
  A countdown answers about the machine rather than about the layout: on a free one it is always
  enough, on a busy one it is not, and a label that overflowed later gets no hint at all.
- **The limit of the width stands on the element itself as well, not on the pill alone.** The
  containing block of the pill is the element, and without a limit on it the element grows by its
  content: a hundred per cent of the pill is then counted from the grown element, and the tag rides
  past the place it was given. Nothing catches this — the unit test raises no styles at all and has
  nothing to measure by, and a frame of the tag alone does not show it either: a tag nobody
  narrowed has nothing to ride past. It is seen by a frame where the place is narrower than the
  label.
- **The label shrinks below its own content only with a zero lower bound of the width.** A part of
  a flexible box keeps the width of its content by default, and an ellipsis then never appears: the
  tag simply rides past its place, whatever the cutting rules say.
- **The styles of the tag live in the cascade layer of the kit's components.** A consumer keeps the
  last word over them, and a rule that rode past the layer takes that away from them silently.
- **The rules of the block are nested inside the host.** The class of the block hangs both on the
  element and on the root of the template, so a rule written by the class alone reaches both, and
  the padding of the pill lands on its own wrapper as well.

## What is out of scope

- **The removal of the pill from a list.** The tag reports a press of the cross and keeps no state:
  the list belongs to the consumer.
- **A pill with an icon and without a word.** That is a button with an icon — the subdomain of
  `rt-icon-button`.
- **A pill of a live counter.** It has a state of its own — alive or broken off — and that is
  another subject, `rt-live-badge`.
- **A colour of the consumer's own outside the palette.** It is answered by overriding the
  component's own property, and the kit does not take an input for it.

## Contract

Not applicable: the surface of the subdomain is the inputs and the output of `rt-tag`, it serves no
procedures.

### Refusal codes

Not applicable: the tag has no refusals of its own.

## Data

The tag has no records of the storage of its own: everything it draws arrives by its inputs.

## Screens and states

| The state                          | What is visible                                            |
| ---------------------------------- | ---------------------------------------------------------- |
| a label and nothing else           | a grey fully rounded pill with the word inside it          |
| a palette is named                 | the pill and the word take the colours of that state       |
| the appearance is the outlined one | a transparent pill with an outline of the palette's colour |
| the shape is the square one        | a pill with a small rounding                               |
| a rounding is named apart          | that rounding, whatever the shape says                     |
| an icon is named                   | the icon before the word, after it, or both at once        |
| the cross is asked for             | a small cross at the right edge; a press goes outward      |
| a size is named                    | the padding, the type size and the icon move to that step  |
| the label is longer than the place | the text is cut by an ellipsis, and a hint shows it whole  |

## Cross-cutting requirements

### Locales

The label of the cross comes from the `rtKit` namespace of the kit's dictionary. Without the
dictionary provider it is empty, and the reader is told nothing about the button.

### SEO

Not applicable: the kit stands in applications behind an entry, and its markup is read by not a
single gatherer of a search engine.

### Mobile layout

The tag has no layout of its own for a narrow screen: it takes the room its place gives and cuts
the label that did not fit — that is the subdomain about text that does not fit.

### Several objects

Not applicable: the kit knows nothing either about the owner of the data or about a division by
objects.

## Decisions

- **The palette is a closed set rather than a colour input.** The argument: a colour arriving as a
  value puts a meaning on the screen that the rest of the kit does not carry, and the token layer
  exists to prevent exactly that. Rejected: a background input with the colour of the text computed
  from it — that is how the first kit's badge is built, and a literal colour in the kit is refused
  by the token check.
- **The cross reports a press and removes nothing.** The argument: a pill that vanishes from the
  screen while the record behind it stays is worse than one that stays. Rejected: keeping the
  removal inside the component — the list belongs to the consumer.
- **The size arrives as a step rather than as a type size.** The argument: the padding, the type
  size and the icon move together, and a type size named apart leaves the padding from another step.
  Rejected: an input for every one of the three — three inputs about one thing diverge silently.

## Open questions

The subdomain has no open questions.

## History of changes

- 2026-09-17 — the subdomain was started: the tag had no spec at all, and `tools/specs-for.mjs`
  answered that not a single one speaks of its file. By the same work the tag took the two things
  the badge of the first kit has and it had not — the sizes and the cutting of a label with a hint
  (RT-1879). Two articles about the width were appended by the frame of the showcase: the cutting
  did not work with the cutting rules already right, and neither the unit test nor a frame of the
  tag alone said so.
