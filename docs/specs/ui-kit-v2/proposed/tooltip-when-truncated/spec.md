# The tooltip of a cut text

**Status:** proposed · **Revision:** 29 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tooltip of the second kit — the mode is an input of `[rtTooltip]`
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2423. It merges into the
spec of the second kit by the last commit of the PR, with the scenario numbers it has now.

## Why

A table cell, a row of a list and a menu item cut a long label with an ellipsis, and the whole text
is read in a tooltip. A short label is seen whole, and a tooltip over it only repeats it. The first
kit hides such a tooltip by a directive standing on Material. The second kit's tooltip has no such
mode: a consumer moving to it gets either a tooltip over every label or none over the cut ones.

## Terminology

| Term        | What it is                                                            |
| ----------- | --------------------------------------------------------------------- |
| the host    | the node that carries `[rtTooltip]`                                   |
| a cut text  | the host's content is wider than the host's visible box               |
| the mode    | the tooltip shows only over a cut text                                |
| the showing | the moment the tooltip appears after the pointer or the focus came in |

### What it is called in the interface

A person sees the same tooltip panel as without the mode; the mode only decides whether it appears.

## Rules

- **The mode is off by default, and without it the tooltip behaves as before.** A consumer that
  never sets the input sees no change.
- **In the mode the tooltip shows only when the host's content is wider than its visible box.** The
  host itself is measured: the node that cuts the text is the node that carries the tooltip.
- **The measurement is taken at the showing, not in advance.** A text that changed or a box that
  shrank after the first render is judged by its state at the moment the tooltip would appear.
- **An empty text still shows nothing, in the mode as without it.**

## What is out of scope

- The first kit is not edited: its directive opens as the sample.
- A text cut by height — a clamp of several lines — is not judged: the first kit judged the width
  alone, and a node with visible overflow would count as cut by height while showing everything.
- A measured node apart from the host is not ported: in all four uses of the first kit it was the
  host itself.

## Contract

Not applicable: the surface is one input of a kit directive, the subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the mode keeps nothing.

## Screens and states

| State                  | What is visible                                            |
| ---------------------- | ---------------------------------------------------------- |
| mode on, the text cut  | the ellipsis, and the tooltip with the whole text on hover |
| mode on, the text fits | the whole text, and no tooltip on hover                    |
| mode off               | the tooltip on hover whatever the width                    |

## Cross-cutting requirements

### Locales

Not applicable: the mode adds no labels; the text of the tooltip arrives from the caller.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: a tooltip appears on hover and focus, and the mode changes neither.

### Several objects

Every host is measured apart: a cut cell and a whole one in the same row get a tooltip and no
tooltip.

## Decisions

- **The mode is an input of `[rtTooltip]`, `rtTooltipWhenTruncated`, and not a second directive.**
  The first kit needed a second directive over the Material tooltip; the second kit's tooltip is its
  own, and the input keeps one place for its behaviour.
- **The measurement is taken at the showing, without observers.** The first kit watched the text by
  a mutation observer, because the Material tooltip shows itself; the second kit's tooltip shows only
  from its own handler, so the sign is always fresh there.

## Open questions

None.

## History of changes

- 29 September 2026 — the agreement was written by the grilling of the owner's request.
