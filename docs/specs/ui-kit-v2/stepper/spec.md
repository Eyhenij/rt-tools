# The stepper bar

**Status:** in force · **Revision:** 11 November 2026 · **Scenario prefix:** `SC-UKV`
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

- **The line runs from the centre of the first point to the centre of the last.** It does not stick
  out past the end points, and the fill ends at the centre of the current point.

- **The label of the first step starts at the left edge, the label of the last ends at the right.**
  Both may take the whole bar.

- **The label of a middle step is centred on the share of its step and never goes past the bar.**
  It stands in a segment centred on that share, as wide as twice the distance to the nearer edge.
  The current point is wider than the rest, so its centre stands up to 4 px off the centre of the
  segment.

- **A middle step near an edge takes the whole bar, pressed to that edge.** When the centred
  segment is narrower than half the bar, the label stands like the label of the first or the last
  step: on sixteen steps «Шаг 2 из 16» starts at the left edge, «Шаг 15 из 16» ends at the right.

- **A label wider than its segment wraps, and the bar grows down.** The points and the description
  move down by the added lines.

- **The current point follows the same number as the label and the fill.** A number past the set is
  held at the last step, a number below zero at the first.

- **The application insets the points from the edges.** One property on `rt-stepper` or a parent
  moves the track, the points and the label inwards by the same distance; by default it is zero and
  the look does not move.

- **The halo of the current point is never cut by the bar.** On the first and the last step it goes
  4 px past the bar edge; a parent that clips its content gives the stepper an inset of at least
  4 px.

- **The label line is 18 px high, as on the mockup.** A wrapped label does not run over itself.

- **Every colour of the stepper is a property of its host, and the application overrides it.** One
  rule on `rt-stepper` or on a parent repaints the track, the fill, the current point, the labels
  and the marks of the list; by default they take the theme tokens, and the look does not move.

## What is out of scope

- The layout of the vertical list (`orientation="vertical"`): it is unchanged. Its colours became
  host properties by the rule above.
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

- three of four, five steps, seven steps, sixteen steps;
- widths 280, 327, 480, 560 and 720;
- sixteen steps with the points inset by 8 px;
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
  move a text by its own width, and the code repeats the mockup. Near an edge the segment would be
  narrower than half the bar, so there the label takes the whole bar pressed to that edge.

## Open questions

None.

## History of changes

- 11 November 2026 — the agreement is written before the code. Task RT-3188.
- 11 November 2026 — the colours of the stepper became consumer handles.
- 11 November 2026 — the agreement is rolled out and stands as the subdomain of the second kit.
  Task RT-3188.
- 11 November 2026 — sixteen steps, the inset of the points and the label pressed to the near edge,
  asked for by the wizard of creating an object. Task RT-3188.
