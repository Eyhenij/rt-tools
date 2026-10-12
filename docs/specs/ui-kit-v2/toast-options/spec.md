# The options of a toast and the modes of the toaster

**Status:** in force · **Revision:** 9 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the toaster and the notification bus of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2478 of the epic RT-2472.

## Why

An application moving from the first kit keeps a toast open until the person closes it, shows how
long a toast has left, shows one toast at a time and paints toasts in its own colours. The second
kit gives every toast the toaster's duration, its own icon and its own colours. The toaster stands
on a layer number written in place.

## Terminology

| Term               | What it is                                                        |
| ------------------ | ----------------------------------------------------------------- |
| the timer          | the countdown after which a toast leaves by itself                |
| the progress strip | the line along the toast's lower edge that shrinks with the timer |
| a handle           | a property the kit reads and the application sets                 |

### What it is called in the interface

A person sees a notification in a corner of the screen, sometimes with a shrinking line under it;
the options and handles are invisible to them.

## Rules

- **The toaster's layer comes from its own property, on the kit's scale.**
- **A toast lives its own duration when it has one, and the toaster's otherwise.**
- **A toast with no duration stays until the close button.**
- **A toast with a progress strip shrinks it over its duration, and the strip pauses with the timer.**
- **A toast that has no timer draws no progress strip.**
- **The toast and each of its filled kinds read their colours from handles.**
- **The toaster in the replace mode lets the previous toasts leave when a new one arrives.**
- **A toast shows its own icon when it has one, and no icon when the icon is turned off.**
- **The icons of the severities come from an injectable map.**
- **A toast with a dismiss callback reports once why it left: the close button, its timer or the
  replace mode; a toast left by its action reports nothing.**
- **Without the new options, handles and mode the toaster behaves and draws as before.**

## What is out of scope

- The toaster's width and offset.
- The label colour of the main action.

## Contract

Not applicable: the surface is options of the notification bus, inputs and properties of kit
components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State                | What is visible                                          |
| -------------------- | -------------------------------------------------------- |
| a toast with a strip | a line under the toast, shrinking until the toast leaves |
| a toast held open    | the toast stays until its close button is pressed        |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The toaster keeps its narrow-screen rule: it spans the screen between the offsets.

### Several objects

Every toast holds its own duration, strip and icon; the handles apply to all toasts under the node
that sets them.

## Decisions

- **The strip is an animation of the toast's lifetime, paused by the same state as the timer.** A
  strip counted apart from the timer would drift from it.
- **The replaced toasts leave by their exit animation.** Removed at once, they would vanish without
  the motion every other toast leaves with.
- **The handles are read with a fallback in place.** The toaster is often drawn once in the
  application's shell, and the application sets the colours on the page root.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2478.
- 9 October 2026 — the dismiss callback, from the application's request, by task RT-2644.
