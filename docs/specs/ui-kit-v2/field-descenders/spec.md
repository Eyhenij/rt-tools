# The descenders of the text in a field

**Status:** in force · **Revision:** 5 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the fields of the second kit: the input, the number input, the autocomplete, the
select, the multiselect, the date picker and the date range
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2526.

## Why

A field of the second kit cuts off the bottom of its text: the tails of «у», «р», «д» are gone in
the select's label, plainly in the small size. The field line height equals the font size, the
kit's font descends below such a line, and the label clips what sticks out for the sake of its
ellipsis.

## Terminology

| Term           | What it is                                                    |
| -------------- | ------------------------------------------------------------- |
| a descender    | the part of a letter below the baseline: the tail of «у»      |
| the field text | the value, the placeholder or the chosen label inside a field |

### What it is called in the interface

A person sees the text in a field; the line height is invisible to them.

## Rules

- **The text in a field shows its descenders whole, at every size and in both presets.**
- **A field keeps its height.**

## What is out of scope

- Line heights of headings, menus, tables and tags, unless they clip a descender the same way.

## Contract

Not applicable: the surface is the look of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State     | What is visible                                   |
| --------- | ------------------------------------------------- |
| any field | its text whole, the tails of the letters included |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable.

### Mobile layout

The coarse pointer enlarges the field font; the rule holds there as well.

### Several objects

Not applicable.

## Decisions

- **The field line height is raised, not the clipping dropped.** The ellipsis of a long label
  needs the clipping, and a line box tall enough for the font keeps both.

## Open questions

None.

## History of changes

- 5 October 2026 — the agreement was written from the owner's report by task RT-2526.
