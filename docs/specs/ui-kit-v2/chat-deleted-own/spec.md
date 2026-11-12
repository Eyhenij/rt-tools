# A deleted reply of one's own in the messenger look

**Status:** in force · **Revision:** 2026-11-12 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The subdomain names how a deleted reply of one's own reads in the messenger look of the chat.

## Why

A person takes back a reply of their own. The reply stays in the thread as a placeholder with a
dashed border and no fill. In the messenger look the text of a reply of one's own is white, because
its bubble is filled with the action colour. The placeholder has no fill, so the white caption was
not readable.

## Terminology

| Term            | What it is                                                             |
| --------------- | ---------------------------------------------------------------------- |
| A deleted reply | a reply with the flag `deleted`; the thread draws a placeholder for it |
| The placeholder | the caption of the kit that stands in place of the text of the reply   |

### What it is called in the interface

| In the spec     | On the screen                                       |
| --------------- | --------------------------------------------------- |
| The placeholder | the line «Message deleted» or the application's own |

## Rules

- **The placeholder of a deleted reply of one's own is muted and italic, the same as of a deleted reply of the other side.** The bubble has no fill, and the colour for a filled bubble does not fit it.
- **The date and the status sign of a deleted reply of one's own take the colours of a reply without a fill.** They stand on the same transparent bubble as the placeholder.
- **A deleted reply in the messenger look casts no shadow.** A shadow under a bubble without a fill reads as dirt.

## What is out of scope

- **The text of the placeholder.** It is a label of the kit, and the application overrides it.
- **The plain look of the chat.** There the text of a reply of one's own is not white.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                             | What is visible                                                          |
| --------------------------------- | ------------------------------------------------------------------------ |
| A deleted reply of one's own      | a dashed bubble without a fill, a muted italic placeholder, a muted date |
| A deleted reply of the other side | as before                                                                |

## Cross-cutting requirements

### Locales

The placeholder comes from the label `rtKit.chatMessageDeleted`.

### SEO

Not applicable.

### Mobile layout

The same as on a wide screen.

### Several objects

Not applicable.

## Decisions

- **The colour of a reply of one's own is not given to a deleted one, instead of a stronger rule for the placeholder.** The argument: the date and the status sign get the right colour by the same condition. The price: none.

## Open questions

- None.

## History of changes

- 2026-11-12 — created by the fix of the white placeholder on a transparent bubble, task RT-3178.
