# The stepper bar

**Status:** agreement before the code · **Revision:** 11 November 2026 · **Scenario prefix:** `SC-UKV`
**Dependencies:** the `stepper/*` colour tokens of the kit
**Законы:** `verifiability`, `frontend-application`
**Procedures:** none

A subdomain of the second kit about the bar of `rt-stepper`: the points, the fill, the label of the
current step and its description, written by task RT-3188. The vertical list of the same component
lives in the subdomain `component-additions`.

## Why

A screen with a wizard shows where a person stands in it: step three of four, on a wide page and in
a narrow side panel alike. The bar drew any set of steps already, but the label of a middle step
hung centred over its point with nothing to hold it: near an edge and in a narrow panel it went past
the bar and was cut by the panel. The mockup could draw only the first, the second and the last of
four steps at one width, so a screen with step three of four could not be drawn at all.

## Terminology

| Term                | What it is                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| **Bar**             | the track with the points and the fill, as wide as the place it stands in |
| **Share of a step** | the place of the current step on the bar: 0 for the first, 1 for the last |
| **Label segment**   | the part of the bar width the label of the current step stands in         |

### What it is called in the interface

The label reads «Шаг 3 из 4 · Гости» or any text the application gives; the kit adds no words.

## Rules

- **The bar draws any number of steps and any current step.** The points spread from edge to edge,
  the ones before the current are passed, the current is larger.

- **The bar is as wide as the place it stands in.** From 280 px in a narrow panel to any width; the
  points and the fill keep their shares.

- **The label of the first step starts at the left edge, the label of the last ends at the right.**
  Both may take the whole bar.

- **The label of a middle step is centred over its point and never goes past the bar.** It stands
  in a segment centred on the point, as wide as twice the distance to the nearer edge.

- **A label wider than its segment wraps, and the bar grows down.** The points and the description
  move down by the added lines.

- **The current point follows the same number as the label and the fill.** A number past the set is
  held at the last step, a number below zero at the first.

- **The label line is 18 px high, as on the mockup.** A wrapped label does not run over itself.

## What is out of scope

- The vertical list (`orientation="vertical"`): it is unchanged.
- Moving a label towards an edge by its own width: the mockup cannot draw it, so the code does not
  do it either.

## Contract

The inputs stay as they were: `steps`, `currentIndex`, `orientation`, `radius`, with the same
defaults.

### Refusal codes

Not applicable: the component requests nothing and refuses nothing.

## Data

Not applicable: the component draws what the application gives it and stores nothing.

## Screens and states

The mockup is the `Stepper` set of the second kit file, node 6924:485, with the `Steps` and
`Current` properties, and the frame of widths, node 7796:946. The states:

- three of four, five steps, seven steps;
- widths 280, 327, 480 and 720;
- the first and the last step with a long label;
- the dark theme.

## Cross-cutting requirements

### Locales

Not applicable: the label text comes from the application.

### SEO

Not applicable: a library component.

### Mobile layout

The bar takes the width of its panel, and a long label wraps instead of going past the edge.

### Several objects

Not applicable.

## Decisions

- **A middle label wraps inside its segment instead of sliding to the edge.** A design tool cannot
  move a text by its own width, and the code repeats the mockup. The price: on seven steps at 327 px
  the label of the second step takes two lines.

## Open questions

None.

## History of changes

- 11 November 2026 — the agreement is written before the code. Task RT-3188.
