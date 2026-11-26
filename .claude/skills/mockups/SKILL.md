---
name: mockups
kind: rule
law: mockups
description: Rule under the mockups law. Load when a screen is drawn or changed in a design tool, before the mockups are shown to the owner and when a design file is audited. Names the kit copy, the spec read before drawing, the agreement checked against mockups. Pattern mockups-measure.
---
<!-- rt-kit v0.41.0 · rules/mockups.needs-mockups.md · 0bf8a69d1820 · правится надстройкой, не здесь -->

# Mockups — how it works here

Rule under the law `docs/constitution/mockups.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

## What it is called here

| In the law | Here |
| --- | --- |
| mockup | a frame on a sheet of the design tool |
| the screen the mockup draws | the page or panel in the application that carries the same name |
| a sheet of the design file | a file page, never a page of the application |
| the description of the behaviour | the domain spec in `docs/specs/<domain>/` |
| the agreement | the product agreement of the task, `docs/specs/<domain>/proposed/<feature>/` |
| approved | shown to the owner and accepted in their words |

## How the law applies here

- **A kit component on a design-tool sheet is a copy of the kit, and the copy drifts.** The source
  of look is the kit's styles in code. Before the component goes into a mockup, it is measured in
  the running showcase, and its sizes, alignment and controls are compared with the bounds of the
  copy's nodes by numbers; a divergence is a question to the owner, fixed once in the copy.
- **A mockup of behaviour the tree already has starts with reading the spec of its domain.** The
  spec is read before the first frame. With a spec or without one, the sample is asked per screen,
  not once for the whole set.
- **The agreement is checked against the approved mockups before work by it.** Every visual rule is
  found on the mockup of each width; a rule the mockups do not show goes to the owner as a question.
- **A mockup is measured by node coordinates before it is shown.** Pattern `mockups-measure`.
- **An audit of a design file is accepted only when every file page that draws a kit component is
  captured, measured and compared with the code of that component.** Names, properties and variants
  do not show what a node draws. Pattern `mockups-measure`.
- **A design-tool call asks the rules gate for this rule,** like the browser driver does for its
  own: otherwise the measurement pattern stays unread.

## What of the law is not here

Nothing checks that a mockup matches its screen or that the owner approved it: both live outside
the tree. The checks above are held by reading.

## Patterns

- `mockups-measure` — the bounds of frames and buttons in one call and what the numbers mean.
