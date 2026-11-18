# The dot appearance of the tag

**Status:** proposed · **Revision:** 2026-11-18 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/tag`
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The product agreement written before the code. It merges into the tag subdomain by the last commit
of the PR, with the same scenario numbers.

## Why

A status on a narrow screen has no room for a word. A header of a record page under 1080 keeps its
buttons as squares without labels, and the status of the record shrinks to a coloured dot. Without
a dot in the kit an application draws its own circle, and that circle carries a colour the palette
of the kit does not hold and says nothing to a screen reader.

## Terminology

| Term    | What it is                                                                     |
| ------- | ------------------------------------------------------------------------------ |
| The dot | The third appearance of the tag: a circle of the palette's colour, no label    |

### What it is called in the interface

| In the domain | On the screen                                         |
| ------------- | ----------------------------------------------------- |
| The dot       | a small coloured circle next to a record, no word     |

## Rules

- **The dot is the third value of the appearance input, not an input of its own.** It is a way to
  draw the tag, like the filled and the outlined ones; a separate switch next to the appearance
  would allow «outlined and a dot», which means nothing.
- **The label of a dot is still required, and it moves into the hint and the accessible name.** The
  dot has no visible word, so the value is the only thing a reader learns: the hint carries it on
  every dot, not only on an overflow, and the dot is an image named by the same value. The dot
  takes the keyboard focus: the hint opens on focus, and without it a keyboard reader never
  reaches the value.
- **The colour of the dot is the state colour of the palette; secondary and neutral take the muted
  text colour.** The text colour of those two is the primary text, nearly black, and a status dot of
  the neutral meaning is grey.
- **The size of the dot follows the size step: sm 6, md 8, lg 10 pixels.** A dot in a row of small
  tags is not larger than they are.
- **The dot is always a circle, whatever the rounding input says.** A square status mark reads as a
  checkbox.
- **The dot draws neither the icons nor the cross.** They need a label next to them; asked for on a
  dot, they are ignored.

## What is out of scope

- **The screen that uses the dot.** The record page header is the work of the application.
- **An animated or pulsing dot.** That is a live state — `rt-live-badge`.
- **The value on a touch screen.** The kit hint opens on hover and focus, and a tap closes it. A
  screen that shows a dot to a finger names the value elsewhere — in the sheet the record opens.

## Contract

Not applicable: the surface is the `appearance` input of `rt-tag`; no procedures.

### Refusal codes

Not applicable.

## Data

None: everything arrives by the inputs.

## Screens and states

| The state                    | What is visible                                                  |
| ---------------------------- | ---------------------------------------------------------------- |
| the appearance is the dot    | a circle of the palette's colour, without a word                 |
| a pointer rests on the dot   | the hint with the whole value                                    |
| a size is named              | the circle is 6, 8 or 10 pixels across                           |

## Cross-cutting requirements

### Locales

No new labels: the hint and the accessible name carry the value the consumer gave.

### SEO

Not applicable.

### Mobile layout

The dot is the narrow-screen form of a status; it has no layout of its own beyond its size.

### Several objects

Not applicable.

## Decisions

- **A value of the existing input rather than a boolean.** Rejected: `dot: boolean` — two inputs
  about one thing and a combination with no meaning.
- **The muted text colour for secondary and neutral.** Rejected: the label colour for every
  palette — the neutral dot would be black.

## Open questions

None.

## History of changes

- 2026-11-18 — the dot appearance was proposed (RT-3389): a record page header on a narrow screen
  shows the status as a coloured dot.
