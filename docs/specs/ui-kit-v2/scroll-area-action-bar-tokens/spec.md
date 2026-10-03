# The properties of the scroll area and the action bar

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the scroll area and the action bar of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2477 of the epic RT-2472.

## Why

An application moving from the first kit fits the scroll area and the action bar to the look it
had. Their paddings and colours are fixed values. The menu of the action bar opens in an overlay,
where the properties of its rounding and shadow declared on the bar do not reach.

## Terminology

| Term        | What it is                                                      |
| ----------- | --------------------------------------------------------------- |
| a host rule | a rule on the component's own tag, written by the application   |
| the menu    | the list of an action with nested actions, opened in an overlay |

### What it is called in the interface

A person sees a scrolling panel with a header and a footer, and a bar of actions over a list; the
properties are invisible to them.

## Rules

- **The scroll area reads the paddings and backgrounds of its header, body and footer, and its own background, from properties.**
- **The action bar reads its background, text colour, padding, gap, font size and the weights of its counter and actions from properties.**
- **The action bar reads the padding of its actions from properties.**
- **The menu of the action bar draws with its rounding and shadow, and reads its colours from properties.**
- **Without the new properties the scroll area and the bar draw as before.**

## What is out of scope

- The holder of the action bar and its placement.
- The scroll hint's colour: it has its own property already.

## Contract

Not applicable: the surface is properties of kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State         | What is visible                                   |
| ------------- | ------------------------------------------------- |
| the open menu | the list under its action, rounded, with a shadow |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The action bar keeps its coarse-pointer rule: an action with an icon hides its label.

### Several objects

Every bar and every scroll area holds its own properties; the menu reads them from the page root.

## Decisions

- **The menu reads its properties with a fallback in place.** A declaration on the bar does not
  reach the overlay, and a declaration on the menu itself would beat the application's rule on the
  page root.
- **The action padding and weight take names the first kit does not use.** A shared name would mean
  two properties on a page with both kits.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2477.
