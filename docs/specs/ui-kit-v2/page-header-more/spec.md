# The page header's «More» item

**Status:** in force · **Revision:** 20 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the page header and its narrow-screen menu
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about the «More» item of `rt-page-header`, written by task RT-2903.

## Why

The full header put its sections into a list that wrapped onto a second row when they did not fit.
The second row pushed the page content down and read as broken layout. Applications with many
sections met it on every window narrower than the sum of their captions.

## Terminology

- **The row** — the sections that stand in the header's line.
- **The «More» item** — the last item of the row; it opens the sections that did not fit.
- **The importance** — the `priority` number of a section; a lower number leaves the row first.

### What it is called in the interface

| In the domain   | On the screen                                             |
| --------------- | --------------------------------------------------------- |
| The «More» item | the caption «More» with the up-and-down mark              |
| A moved section | a dark line in the panel, as a section of the narrow menu |
| A section group | a grey caption with the section's items under it          |

## Rules

- **Sections that do not fit the header's width go into the «More» item at the end of the row.**
  The header never wraps onto a second row.
- **The «More» item shows only when at least one section does not fit.**
- **The least important sections leave first, and the order of the rest does not change.** Equal
  importance sends the section standing further from the start.
- **The «More» panel draws the moved sections as the narrow-screen menu draws them.** A section
  with a panel stands as a heading with its groups and items under it.
- **The selected section inside «More» highlights the «More» item, and the panel marks the
  selected line.**
- **The header does not widen a container that sizes itself by the header.** The row declares the
  width of its widest section, and the rest goes into «More».
- **The «More» caption is a kit label with an English default and the consumer's translation.**

## What is out of scope

- Counting how often a section is opened: the application passes the importance.
- The narrow-screen menu: below its threshold the header shows the burger as before.

## Contract

None: the part is a control and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the sections and their importance come from the application.

## Screens and states

| state                | what is drawn                                             |
| -------------------- | --------------------------------------------------------- |
| everything fits      | all sections in the row, no «More»                        |
| some do not fit      | the first sections by importance and «More» at the end    |
| nothing fits         | only «More»                                               |
| selected inside More | «More» highlighted, the selected line marked in its panel |

## Cross-cutting requirements

### Locales

The caption is the kit label `uiNavMore`, English in the package and translated by the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

Below the narrow threshold the header keeps its burger; «More» exists only in the full header.

### Several objects

Not applicable: one header has one row.

## Decisions

- **The fit is a pure function of the widths.** The component measures, `fitRow` decides, and the
  decision is checked by a call.
- **A moved section keeps its place in the list, only hidden.** Its width is measured on every
  resize, so the row knows when it fits again.
- **The panel reuses the narrow-screen menu block.** One look for the same sections in two places.

## Open questions

None.

## History of changes

- 20 October 2026 — written by the task RT-2903 straight into the kit spec.
