# The media of a card

**Status:** proposed · **Revision:** 2026-10-20 · **Scenario prefix:** `SC-UKV`
**Laws:** `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about the place above the title of `rt-card`: a mark, a picture or
an icon that stands in the top left corner, with the title and the content under it.

## Why

A card of a services screen shows the mark of the service first and its name under it. The card
puts its title first and its header slot after the title, so nothing can stand above the title.
Without a place of its own a screen either restyles the inside of the card or draws the title
itself, and its cards stop matching the rest.

## Terminology

- **The media** — what the consumer puts above the title: a mark, a picture or an icon.

### What it is called in the interface

The part has no text of its own: the media is what the consumer gives.

## Rules

- **The media stands above the header, before the title.** It is given by the slot
  `[rtCardMedia]` and keeps the left edge of the card content.

- **An empty media slot takes no room.** A card without media looks as before.

- **The header slot and the title keep their order.** What a consumer puts next to the title stays
  there.

## What is out of scope

- The media at the side of the title: the media stands above it.
- The size of the media: the consumer chooses it.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own.

## Screens and states

| state         | what is drawn                                    |
| ------------- | ------------------------------------------------ |
| with media    | the media, a gap, then the title and the content |
| without media | the title and the content, as before             |

## Cross-cutting requirements

### Locales

The part has no text of its own.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The media stays above the title on any width.

### Several objects

Not applicable.

## Decisions

- **A slot of its own, not a reordered header slot.** Cards that put actions next to their title
  keep their look.

## Open questions

None.

## History of changes

- 2026-10-20 — written by the task RT-2904.
