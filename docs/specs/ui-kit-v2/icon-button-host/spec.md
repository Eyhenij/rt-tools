# The size and background of the icon button from its tag

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon button of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2493 of the epic RT-2472.

## Why

An application moving from the first kit sets the size and background of an icon button on the
button's own tag. The size and kind modifiers of the second kit declare both on the inner button,
and a value set on the tag never reaches it. The application also needs buttons smaller than `sm`.

## Terminology

| Term        | What it is                                                     |
| ----------- | -------------------------------------------------------------- |
| a host rule | a rule on the component's own tag, written by the application  |
| a step      | the value a size or kind modifier gives when nothing else does |

### What it is called in the interface

A person sees a square button with an icon; the properties are invisible to them.

## Rules

- **A size set on the icon button's tag or above it reaches the button, and without it the size step applies.**
- **A background set on the icon button's tag or above it reaches the button, and without it the kind's background applies.**
- **The hover background comes from its own property, and without it the kind's hover background applies.**
- **The sizes xs and 2xs draw buttons of 22 and 20 pixels with a 16 pixel icon.**
- **Without the new properties and sizes the icon button and the header draw as before.**

## What is out of scope

- The header's own button size.
- A colour property for each kind.

## Contract

Not applicable: the surface is inputs and properties of a kit component.

### Refusal codes

Not applicable.

## Data

Not applicable: the component keeps nothing.

## Screens and states

| State           | What is visible                                  |
| --------------- | ------------------------------------------------ |
| a host rule set | the button takes the size and background given   |
| xs, 2xs         | a button of 22 or 20 pixels with a 16 pixel icon |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: the size is chosen by the input, not by the screen.

### Several objects

Every button holds its own size and background; a property set above applies to all buttons under
that node.

## Decisions

- **The modifiers write private steps, and the button reads them under the public properties.** A
  public property set on the tag, above it or on the button itself then wins over the step.
- **The `xs` step is written in place.** The size scale has no 22 pixel step, and a step for one
  button would not lie on its 4 pixel grid.
- **The header loses its 35 pixel override.** It never worked, and with this change it would shrink
  the header's buttons.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the owner's request by task RT-2493.
