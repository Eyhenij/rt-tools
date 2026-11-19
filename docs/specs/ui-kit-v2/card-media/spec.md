# The media of a card

**Status:** in force · **Revision:** 2026-10-20 · **Scenario prefix:** `SC-UKV`
**Laws:** `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about the place above the title of `rt-card`: a mark, a picture or
an icon that stands in the top left corner and a state tag in the top right corner of the same row,
with the title and the content under it. The part also holds the outline of the card, which the
consumer switches on.

## Why

A card of a services screen shows the mark of the service first and its name under it. The card
puts its title first and its header slot after the title, so nothing can stand above the title.
Without a place of its own a screen either restyles the inside of the card or draws the title
itself, and its cards stop matching the rest.

## Terminology

- **The media** — what the consumer puts above the title: a mark, a picture or an icon.
- **The header end** — what the consumer puts at the right edge of the media row: a state tag.
- **The outline** — a one pixel line around the card in the colour of the default border.

### What it is called in the interface

The part has no text of its own: the media is what the consumer gives.

## Rules

- **The media stands above the header, before the title.** It is given by the slot
  `[rtCardMedia]` and keeps the left edge of the card content.

- **The header end stands in the media row, at the right edge.** It is given by the slot
  `[rtCardHeaderEnd]`, sits level with the middle of the media and keeps the right edge of the card
  content. Without media it still stands at the right edge.

- **An empty media row takes no room.** A card with neither media nor header end looks as before.

- **The outline is switched on by an input.** The input `bordered` draws a one pixel line of the
  default border colour inside the card edge; the radius does not change and the content moves in
  by the width of the line. Without the input the card has no line, so the cards that do not ask
  for it stay as they were.

- **An empty media slot takes no room.** A card without media looks as before.

- **The header slot and the title keep their order.** What a consumer puts next to the title stays
  there.

## What is out of scope

- The media at the side of the title: the media stands above it.
- The look of the tag: the consumer chooses its colour and text.
- The size of the media: the consumer chooses it.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own.

## Screens and states

| state           | what is drawn                                                            |
| --------------- | ------------------------------------------------------------------------ |
| with media      | the media, a gap, then the title and the content                         |
| with header end | the media on the left, the tag on the right, level with the media middle |
| without media   | the title and the content, as before                                     |
| with outline    | a one pixel line around the card                                         |

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

- 2026-10-20 — written and carried out by the task RT-2904.
- 2026-11-19 — the header end slot and the outline input added.
