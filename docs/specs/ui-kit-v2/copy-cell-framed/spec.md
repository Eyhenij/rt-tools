# The copy cell in the frame of a field

**Status:** in force · **Revision:** 2026-11-02 · **Scenario prefix:** `SC-UKV`
**Depends on:** the field of input of the second kit — the frame is taken from it
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec about the input `framed` of `rt-copy-cell`, written by the task
RT-2994.

## Why

A copy cell lives in a table row and shows its button when the pointer is over the row. A form of a
panel has no row to point at, so an address the person must copy into another service had no place
in it that looked like the fields around it.

## Terminology

- **The framed cell** — a copy cell drawn with the background, the border and the rounding of a field
  of input.

### What it is called in the interface

No new words on the screen.

## Rules

- **A framed copy cell stands in the frame of a field and keeps its button visible.** The value is
  drawn at the font step of a field, and a press copies it the same way as in a table.

## What is out of scope

- The look of the field of input itself: the cell takes its properties and does not change them.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen    | Loading   | Empty     | Refusal   |
| --------- | --------- | --------- | --------- |
| Copy cell | no change | no change | no change |

## Cross-cutting requirements

### Locales

No new texts.

### SEO

Not applicable.

### Mobile layout

A long value wraps onto a second line inside the frame, as in the panel form on a phone.

### Several objects

Not applicable.

## Decisions

- **The framed cell is an input of the cell, not a component of its own.** The copying, the hint and
  the reply «Copied» stay one code for the table and for the form.

## Open questions

None.

## History of changes

| Date       | What changed                                        |
| ---------- | --------------------------------------------------- |
| 2026-11-02 | Written by the task RT-2994, scenario `SC-UKV-1115` |
