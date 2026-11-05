---
name: mockups-measure
kind: pattern
rule: mockups
description: Pattern of rule mockups. Load before frames are shown to the owner and before an audit is called finished — reading the bounds of frames and buttons in one call, overlapping pairs, tops of a row, comparing a page with the code. Not for a running page — that is the rule browser-verification.
---
<!-- rt-kit v0.33.1 · patterns/mockups-measure.needs-mockups.md · 3bb81c5e0e45 · правится надстройкой, не здесь -->

# Measuring a mockup

Pattern of the rule `mockups`. What must be true — the law `docs/constitution/mockups.md`.

## When to use

- The frames of a sheet are about to be shown to the owner.
- A row of cards, a toolbar or a form is drawn at a width other than the desktop one.
- An audit of a design file is about to be called finished.

## A mockup is measured by node coordinates

A frame in a design tool makes a layout claim, just like a page. A look at its screenshot misses the
same things: the buttons of a card row are off one line, or frames on the sheet overlap. Before the
frames are shown to the owner, one call reads the bounds of the sheet's top-level frames and of the
buttons inside them. It prints the overlapping pairs and each row's distinct button tops. Two
values in one row are the defect.

## An audit is compared page by page with the code

A page here is a page of the design file that draws one kit component, not a screen of the
application. Each such page is captured, and the picture is put next to the component's template
and styles. The question for every page is one: does the code draw this. A shape in doubt is then
measured from the node properties — arc data, corner radii, variable modes — and searched for across
the whole file: a defect on one page repeats on others. The report lists the pages compared and the
pages not captured, and with even one of the second kind the audit stays open.

## Common misses

- **At the tablet width the buttons of a card row stood at different heights, and frames on the
  sheet overlapped.** The owner found both; one call reading node bounds would have shown them.
- **An audit was called finished by inputs, names and the list of variants.** The spinner arc stood
  on four pictures as a sector and was called normal, because nobody asked whether the code draws
  it so.
