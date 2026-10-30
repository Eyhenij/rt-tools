# The hint of a cut value in the copy cell

**Status:** in force · **Revision:** 21 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tooltip of the second kit
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2919 and merged with the
scenario number it had as an agreement.

## Why

A copy cell cuts a long value with an ellipsis and shows it whole in a hint. The hint appeared
only from the second hover, so a person who pointed at a cut e-mail once saw nothing.

## Terminology

- **The cut value** — the shown text of the cell that is wider than its box.

### What it is called in the interface

No new words on the screen.

## Rules

- **The cut value of a copy cell shows its hint from the first hover.**

## What is out of scope

- The tooltip directive itself: its behaviour does not change.

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

No change: a touch shows no hint, as before.

### Several objects

Not applicable.

## Decisions

- **The cell updates its own view right after the measurement.** The outer element gets
  `mouseenter` first, so the text reaches the directive before the span asks for it.

## Open questions

None.

## History of changes

| Date       | What changed                                         |
| ---------- | ---------------------------------------------------- |
| 2026-10-21 | The agreement is written                             |
| 2026-10-21 | The agreement merges into the spec of the second kit |
