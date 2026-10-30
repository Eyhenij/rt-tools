# The block of a service

**Status:** in force · **Revision:** 2026-10-22 · **Scenario prefix:** `SC-UKV`
**Depends on:** the logo of a service — the mark of the block is drawn by it
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-service-block`: the first block of the body of a panel
that sets up a connection to an outside service. On the left stands the mark of the service, on the
right its name and one line of description, and a line under the block parts it from the content
of the panel. The numbers are the numbers of the design-system component «Service Block».

## Why

The panels of integrations, payment methods and messengers open with the same thing: what service
is being set up. Without a part of the kit every panel draws its own row of a mark and two lines,
and the panels of one application stop lining up at the first edit of one of them.

## Terminology

- **The mark** — the logo of the service, drawn by `rt-service-logo` at the size `md`.
- **The name** — the name of the service, the first line of the text.
- **The description** — one line under the name that says what the connection is for.
- **The line** — the thin rule under the block.

### What it is called in the interface

| In the domain   | On the screen                                    |
| --------------- | ------------------------------------------------ |
| The mark        | the logo of the service in the light circle      |
| The name        | the bold title next to the logo                  |
| The description | the grey line under the title                    |
| The line        | the thin rule that parts the block from the form |

## Rules

- **The mark is the logo of a service at the size `md` and takes the same items.** One mark, or
  several laid over one another by the step of the logo; an image by address or a kit icon.

- **The name and the description stand to the right of the mark, centred on it.** The gap from the
  mark to the text is 16, from the name to the description 2. The name is the heading step `xl`
  semibold in the primary text colour; the description is the body step `sm` regular in the muted
  text colour.

- **A line in the subtle border colour, 1 thick, stands 20 under the block.** It runs the whole
  width of the block.

- **The block takes the whole width of its place, and the text wraps instead of being cut.** On a
  narrow place the description and the name go onto further lines; a word longer than the place
  breaks.

- **The block carries no text of its own.** The name and the description come from the consumer;
  an empty description draws no line of description.

## What is out of scope

- The size of the mark: the component draws `md` only.
- A press on the block: the part is a heading, not a control.
- The content of the panel under the line.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own. The marks are given as items of the input `logos`, the same items as the logo of
a service takes; the name and the description are strings.

## Screens and states

| state               | what is drawn                                                      |
| ------------------- | ------------------------------------------------------------------ |
| one mark            | the mark, the name and the description, the line under them        |
| several marks       | the marks overlapping by the step of the logo, the text after them |
| without description | the mark and the name alone, the name centred on the mark          |
| a narrow place      | the description wraps onto further lines                           |

## Cross-cutting requirements

### Locales

The part has no text of its own. The name, the description and the labels of the marks come from
the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The block keeps the mark at its size and gives the text the rest of the width: on a phone the
description wraps.

### Several objects

Not applicable.

## Decisions

- **The numbers are taken from the component, not picked by eye.** The owner made the component
  the reference for the panels of integrations, payments and messengers.
- **The mark is the existing logo of a service.** A plate and a shadow of its own would repeat it.
- **The size of the mark is not an input.** The component has one size; an input with one value
  would be an axis nobody chooses.

## Open questions

None.

## History of changes

- 2026-10-22 — written by the task RT-2934.
