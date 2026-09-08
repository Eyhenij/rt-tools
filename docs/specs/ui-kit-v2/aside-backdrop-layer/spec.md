# The backing of a panel and the layers of the design

**Status:** in force · **Revision:** 2026-09-05 · **Scenario prefix:** `SC-UKV`
**Depends on:** the right panel of the frame and its permanent overlay; the layers of the design of the kit
**Laws:** `frontend-application`
**Procedures:** none

## Why

The frame holds the right panel as a permanent overlay: it is created as soon as the application has
declared the template of the panel, and stands closed until the panel is opened. The backing of such
an overlay is obliged to be invisible and to catch no presses — otherwise it covers the screen whole,
and the application stops answering presses without showing that by anything.

The rules of the backing lie in the layer of the design of the kit, and the rules of the library of
the overlays lie outside the layer. A rule outside a layer is stronger than any layered one, and the
order of the layers does not change that: at a consumer that takes the styles of the kit by layers,
the backing of a closed panel stays visible and intercepts the presses.

## Terminology

- **The backing** — the node the library of the overlays puts under the panel over the whole screen.
- **A permanent overlay** — an overlay created together with the declaration of the template of the
  panel and standing closed until the panel is opened.
- **The rule of the visibility** — what decides whether the backing is visible and whether it catches
  the presses.
- **A rule of the design** — the colour, the blur and the length of the transition of the backing.

### What it is called in the interface

Nothing of its own appears on the screen: the matter is that a closed panel does not hinder the work
with the page.

## Rules

- **The rule of the visibility of the backing is declared outside the layer.** A layered rule loses to
  a non-layered one regardless of the specificity, and the backing of a closed panel stays visible at
  any consumer that takes the styles of the kit by layers.
- **The rule of the visibility of a closed panel is declared there too and for the same reason.** A
  panel as wide as the whole screen covers the page until its shift is counted out.
- **The rules of the design stay in the layer.** The colour, the blur and the transition are overridden
  by the application with its own rules, and the layer was created for exactly that.

## What is out of scope

The creating of the overlay together with the declaration of the template of the panel does not
change: it stays permanent.

## Contract

Not applicable: the panel has no calls of the network.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| The state of the panel | The backing                             |
| ---------------------- | --------------------------------------- |
| closed                 | invisible, catches no presses           |
| open                   | visible, a press on it closes the panel |

## Cross-cutting requirements

### Locales

Not applicable: the backing has no text.

### SEO

Not applicable.

### Mobile layout

On a narrow screen the panel takes the width of the screen whole, and the rule of the visibility of a
closed panel is especially important there: until the end of the shift it covers the page.

### Several objects

Not applicable.

## Decisions

- **Exactly two rules are taken out, not the file whole.** The design in the layer is what the layer
  was created for: the application overrides the colour and the blur by its own rules. To take
  everything out would mean taking that possibility away from the application.

## Open questions

- `Q-UKV-1` — whether the library of the overlays itself needs a layer. It is decided by the owner: an
  edit of a foreign package is not made here.

## History of changes

- 2026-09-05 — the agreement was written down by the task RT-1771.
