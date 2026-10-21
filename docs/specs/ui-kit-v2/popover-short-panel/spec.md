# A short panel of the popover

**Status:** in force · **Revision:** 21 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the popover of the second kit
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2921 and merged with the
scenario number it had as an agreement.

## Why

A popover that must fit the viewport keeps a threshold of 120 points: lower than that, shrinking
the panel is pointless, so it is moved instead. The same number stretched every short panel to 120,
and an empty strip stood under two items of the header's «More».

## Terminology

- **A short panel** — a panel whose content is lower than the fit threshold.

### What it is called in the interface

No new words on the screen.

## Rules

- **A short panel in the fit-viewport mode is as high as its content.**

## What is out of scope

- The fit decision itself: the threshold and the shrinking of a long panel do not change.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen        | Loading   | Empty     | Refusal   |
| ------------- | --------- | --------- | --------- |
| Popover panel | no change | no change | no change |

## Cross-cutting requirements

### Locales

No new texts.

### SEO

Not applicable.

### Mobile layout

No change.

### Several objects

Not applicable.

## Decisions

- **The threshold stays in the overlay config, and the pane loses its inline minimum height.** The
  overlay reads the config for the fit decision and does not read the pane style.

## Open questions

None.

## History of changes

| Date       | What changed                                         |
| ---------- | ---------------------------------------------------- |
| 2026-10-21 | The agreement is written                             |
| 2026-10-21 | The agreement merges into the spec of the second kit |
