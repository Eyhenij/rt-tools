# A hover popover under a touch

**Status:** proposed · **Revision:** 30 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the popover of the second kit, the page header of the second kit
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3000.

## Why

On a phone a tap on the user name in the page header opened the profile menu twice. The tap
produced a hover first, and the hover opened the menu on its backdrop. The press of the same tap
then landed on that backdrop and closed the menu, and the hover that the browser repeats after the
backdrop goes opened the menu again. The page stayed dimmed under a backdrop with no menu on it,
and nothing on it could be pressed.

## Terminology

- **A hover popover** — a popover whose panel opens when the pointer comes over its host.

### What it is called in the interface

No new words on the screen.

## Rules

- **A hover popover follows the hover of a mouse only.** The hover a browser derives from a touch
  or a pen neither opens nor closes the panel.
- **A press on the host of a hover popover opens the panel.** A tap opens it once, and a popover
  with no press handler of its own in the template opens by it too.
- **A tap on the backdrop of a hover popover closes the panel and leaves no backdrop.**
- **The profile menu fits the room under the user name, and its items scroll inside it.** On a low
  screen — a phone on its side, a short window — the lower items went past the bottom edge, and
  "Sign out" could not be reached.

## What is out of scope

- The mouse keeps opening the panel on hover and closing it on leave, as before.
- The popovers with the press trigger and the manual trigger do not change.
- The look of the panels and the backdrop does not change.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen        | Loading   | Empty     | Refusal   |
| ------------- | --------- | --------- | --------- |
| Popover panel | no change | no change | no change |
| Profile menu  | no change | no change | no change |

## Cross-cutting requirements

### Locales

No new texts.

### SEO

Not applicable.

### Mobile layout

A tap on the user name of the page header on a narrow screen opens the profile menu once, on one
backdrop. On a screen lower than the menu, the menu ends at the bottom edge and scrolls.

### Several objects

Not applicable.
