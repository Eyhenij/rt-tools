# What the other parts of the kit give an application moving from Material

**Status:** in force · **Revision:** 2026-10-27 · **Scenario prefix:** `SC-UKV`
**Depends on:** the toggle group, the expansion panel, the toast, the shell, the drawer, the stepper, the button, the icon button, the field, the side menu, the tooltip and the radio group of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about what the parts of the kit other than the fields and the tabs
took over from Material for an application that moves onto the kit: the toggle group with a form
and chips, the expansion panel in a group, the toast with the application's own component, the
right panel of the shell, the embedded drawer, the vertical stepper, the badge, the divider, the
progress bar, the focus ring of a button, the search of the side menu, the tooltip delay, the
tooltip closed by Escape, the radio group, the icon button as a link and the focus of the icon
button and the field from the application's code.

## Why

An application that moves from Material onto the second kit used each of these parts, and each
lacked something the application's screens stood on: a toggle group in a form, a panel in a group
that opens one at a time, a toast drawn by the application's component, a drawer inside a page
area, a focus ring that does not flash after a mouse press, a tooltip with its own delay. Without
them the application kept Material next to the kit. Every addition is optional: a part that names
none of them looks and behaves as before.

## Terminology

- **The focus ring** — the outline a button draws while it has focus.
- **The source of focus** — what moved focus to the button: the keyboard, the mouse, a touch or
  code; the CDK writes it on the button as a `cdk-*-focused` class.
- **The shared tooltip delay** — the show delay from the kit settings, 300 ms without them.
- **A tooltip's own delay** — the `showDelay` input of one element.

### What it is called in the interface

| In the domain  | On the screen                                     |
| -------------- | ------------------------------------------------- |
| The focus ring | the coloured outline around a button in focus     |
| The tooltip    | the dark hint that shows over an element on hover |

## Rules

- **A button draws the focus ring only for focus not from the pointer.** The browser marks focus
  from code after a mouse press as `:focus-visible`; the kit button and icon button read the source
  from the CDK, as Material does, and keep the focus while hiding the ring.
- **A tooltip takes a show delay of its own.** It wins over the delay from the kit settings for that
  one element; without it the element waits the shared delay, 300 ms by default.
- **Escape on the host closes an open tooltip and stops there.** The key goes no further than the
  host, as with Material; the focus stays on the host, and the next hover or keyboard focus shows the
  tooltip again.
- **Escape with no tooltip open goes on to the parent.** A dialog or a panel above the host closes
  on it as before; a pending showing is cleared, and nothing appears after the delay.
- **An icon button given a route draws a link with the look of the button.** The browser then opens
  it in a new tab from its context menu, and a screen reader calls it a link, as with the Material
  icon button on `<a>`. Without a route the markup stays a button.
- **An unavailable icon-button link leads nowhere.** Disabled or loading, it loses its address,
  leaves the Tab order, and its click goes no further, as the button does.
- **An icon button names the panel it opens.** The kind of the panel goes to `aria-haspopup`; without
  it the attribute is absent.
- **The application focuses the icon button and the field by a method of the component.** It reaches
  the inner element through the component, not through the markup of the kit.

## What is out of scope

- The fields and the tabs — the subdomains `field-label-icon-actions`, `field-material-look` and
  `tab-additions`.
- The earlier behaviour of these parts — their own subdomains, where they have one:
  `toggle-button-group`, `expansion-panel`, `side-menu`, `radio-button`.

## Contract

Not applicable: the surface is the inputs and outputs of components of the kit and the kit
settings, the subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                                  | What is visible                        |
| -------------------------------------- | -------------------------------------- |
| a button focused from the keyboard     | the focus ring                         |
| a button focused by code after a press | no ring, the focus stays on the button |
| a tooltip with its own delay           | shown after that delay                 |
| a tooltip without its own delay        | shown after the shared delay           |
| an open tooltip after Escape           | hidden, the focus stays on the host    |

## Cross-cutting requirements

### Locales

Not applicable: the labels and tooltips come from the consumer.

### SEO

Not applicable.

### Mobile layout

Nothing of its own beyond the right panel over the page, which takes the whole width of a narrow
window: scenario `SC-UKV-1014`.

### Several objects

Not applicable.

## Decisions

- None.

## Open questions

None.

## History of changes

- 2026-10-13 — written before the code, from the application's request accepted by the owner.
- 2026-10-23 — the application's request: the show delay of one tooltip.
- 2026-10-23 — merged from the agreement into the subdomain, task RT-2812.
- 2026-10-27 — Escape closes an open tooltip, task RT-2948.
- 2026-10-27 — the icon button as a link, its `aria-haspopup` and the focus methods of the icon
  button and the field, task RT-2951.
