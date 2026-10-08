# The prompt suggestion

**Status:** in force · **Revision:** 2026-10-08 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-prompt-suggestion`: a card with a ready question on the
empty screen of an AI assistant.

## Why

On the empty screen of an assistant the ready questions are drawn as generic buttons. The mockup
draws a filled card with the text on the left and an arrow on the right at the same offset.

## Terminology

- **The suggestion** — a ready question the person can ask with one press.

### What it is called in the interface

| In the domain  | On the screen                                    |
| -------------- | ------------------------------------------------ |
| The suggestion | «Give me a performance overview» with an arrow → |

## Rules

- **The card is a button with the question on the left and an arrow on the right edge.** The card
  takes the width of its parent, so the arrows of a column of cards stand on one line.

- **A press reports the text of the question out.** What to do with it is the consumer's decision.

- **A disabled card cannot be pressed.**

## What is out of scope

- Sending the question: the consumer does it.

## Contract

None: the card is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own.

## Screens and states

| state    | what is drawn                              |
| -------- | ------------------------------------------ |
| at rest  | the filled card, the text, the muted arrow |
| hover    | the darker fill                            |
| focus    | the kit's focus ring                       |
| disabled | the disabled text, no press                |

## Cross-cutting requirements

### Locales

The kit draws no text of its own here: the question comes from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The card takes the width it is given; a long question wraps.

### Several objects

Not applicable.

## Decisions

- **A card of its own, not a button appearance.** The button centres its label and has no arrow at
  the far edge.

## Open questions

None.

## History of changes

- 2026-10-08 — written by the task RT-2653 of the epic RT-2649, which brings the assistant chat
  into the kit.
