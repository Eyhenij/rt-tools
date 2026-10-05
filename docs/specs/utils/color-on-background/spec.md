# The text colour on a background

**Status:** in force · **Revision:** 5 October 2026 · **Scenario prefix:** `SC-UT`
**Depends on:** none
**Laws:** `verifiability`, `code-structure`
**Procedures:** none

The first agreement of the utils package, written before the code by task RT-2524.

## Why

An application moving from the first kit colours the text of its badges by a function that picks a
readable text colour for a background: white on a dark one, the background darkened by half on a
light one. The second kit's tag has a closed palette and does not carry the function, so after the
move the application has nowhere to take it from.

## Terminology

| Term             | What it is                                                 |
| ---------------- | ---------------------------------------------------------- |
| a hex colour     | `#rgb` or `#rrggbb`, with or without the leading `#`       |
| a light colour   | a colour whose relative luminance is above 0.179           |
| darkening by `p` | every channel multiplied by `1 - p / 100` and rounded down |

### What it is called in the interface

Not applicable: the functions have no screen.

## Rules

- **The text colour on a dark background is white.**
- **The text colour on a light background is that background darkened by half.**
- **A short colour and a colour without `#` are read as their full form.**
- **A value that is not a hex colour gives white text and comes back undarkened.**
- **On a six-digit colour with `#` both functions answer as the first kit's.**

## What is out of scope

- A contrast ratio between two arbitrary colours, and colours other than hex.
- The first kit's own copy: it stays where it is.

## Contract

Not applicable: the surface is two exported functions of the package, not procedures.

### Refusal codes

Not applicable: the functions throw nothing.

## Data

Not applicable: the functions keep nothing.

## Screens and states

Not applicable: the functions have no screen.

## Cross-cutting requirements

### Locales

Not applicable: the functions return no words.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the functions are pure.

## Decisions

- **The names stay as in the first kit.** The application changes only the import path.
- **The utils version reads short and bare colours in both functions.** In the first kit the text
  colour function stripped the first character blindly, and such a colour gave a wrong answer.
- **The threshold and the half darkening are the first kit's.** A migrated badge keeps its look.

## Open questions

None.

## History of changes

- 5 October 2026 — the agreement was written from the owner's word by task RT-2524.
