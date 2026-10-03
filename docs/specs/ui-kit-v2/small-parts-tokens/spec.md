# The properties of the small parts

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tag, the toggle switch, the toggle button group, the toolbar, the button and the tooltip of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2476 of the epic RT-2472.

## Why

An application moving from the first kit fits the second kit's small parts to the look it had.
The tag, the toggle switch and the toggle button group declare their sizes on the root of their
template, so a rule on the component's tag does not reach them. The tag's colours and paddings,
the toolbar's layout and the disabled look of the toggle switch are fixed values. The toggle
switch has no label of its own, a loading button cannot keep its width without its label, and a
tooltip cannot stand beside its anchor.

## Terminology

| Term        | What it is                                                               |
| ----------- | ------------------------------------------------------------------------ |
| a host rule | a rule on the component's own tag, written by the application            |
| a size step | the kit's value of a size property for one value of the size input       |
| a handle    | a property the kit does not declare; its fallback is the kit's own value |

### What it is called in the interface

A person sees a tag, a switch with its label, a toolbar, a button and a hint; the properties are
invisible to them.

## Rules

- **A host rule overrides the size properties of the tag, the toggle switch and the toggle button group, and the size steps work as before.**
- **The tag reads its colours, paddings and letter-spacing from handles, with its severity and size as the fallback.**
- **The toggle switch takes a label: a press on it toggles the switch, and it names the switch for a screen reader.**
- **The disabled opacity of the toggle switch is a property, `0.5` by default.**
- **The toolbar reads its height, inline padding, bottom border, alignment of the centre, gap and overflow of the centre from properties.**
- **A loading button can hide its label and keep its width.**
- **A tooltip stands on the left or on the right of its anchor.**
- **Without the new inputs and properties every component draws as before.**

## What is out of scope

- Renaming the rounding scale.
- The dialog and toast properties — tasks RT-2479 and RT-2478.

## Contract

Not applicable: the surface is inputs and properties of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State                          | What is visible                                              |
| ------------------------------ | ------------------------------------------------------------ |
| a switch with a label          | the switch and its label after it; a press on either toggles |
| a loading button, label hidden | the spinner in a button of the label's width                 |
| a tooltip on the left or right | the hint beside the anchor, pointing at it                   |

## Cross-cutting requirements

### Locales

The label of the toggle switch is the application's text; the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

A tooltip that does not fit on its side moves to the opposite side, as above and below do today.

### Several objects

Every component holds its own properties; two switches with different labels stand side by side.

## Decisions

- **Size properties move to the host together with their steps.** A step is a host rule by an
  attribute, and an application rule outside the kit's layer stays stronger than it.
- **A property a kit modifier must yield to is a handle.** The kit's value becomes the fallback.
- **The disabled opacity stays `0.5`.** The kit's disabled opacity step is `0.6`; taking it would
  move every disabled switch.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2476.
