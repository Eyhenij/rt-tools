---
name: mockups-measure
kind: pattern
rule: mockups
description: Pattern of rule mockups. Load before the frames of a mockup are shown to the owner — reading the bounds of the sheet's frames and of the buttons inside them in one call, overlapping pairs and the distinct tops of a row. Not for checking a running page — that is the rule browser-verification.
---

# Measuring a mockup

Pattern of the rule `mockups`. What must be true — the law `docs/constitution/mockups.md`.

## When to use

- The frames of a sheet are about to be shown to the owner.
- A row of cards, a toolbar or a form is drawn at a width other than the desktop one.

## A mockup is measured by node coordinates

A frame in a design tool makes a layout claim, just like a page. A look at its screenshot misses the
same things: the buttons of a card row are off one line, or frames on the sheet overlap. Before the
frames are shown to the owner, one call reads the bounds of the sheet's top-level frames and of the
buttons inside them. It prints the overlapping pairs and each row's distinct button tops. Two
values in one row are the defect.

## Common misses

- **At the tablet width the buttons of a card row stood at different heights, and frames on the
  sheet overlapped.** The owner found both; one call reading node bounds would have shown them.
