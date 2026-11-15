# The conversation list rows on a narrow touch screen

**Status:** proposed · **Revision:** 2026-11-15 · **Scenario prefix:** `SC-UKV`
**Depends on:** `channel-sign` — the sign of the channel stands at the start of a row
**Laws:** `frontend-application`, `mockups`
**Procedures:** none

A product agreement written before the code. It merges into the `ai-chat` subdomain of the kit spec,
next to the rule about the row actions on a touch screen, with the same scenario numbers.

## Why

The sign of a messenger row casts a shadow of 24, wider than the row inset of 12 at the side and 10
above. The scrolled list clips what leaves its box, so on a narrow screen the shadow is cut at the
left edge of every row, above the first row and below the last one.

A touch screen keeps the hover state of the last touched element. A row painted on hover stays grey
after a tap and reads as the selected one.

## Terminology

| Term            | What it is                                                         |
| --------------- | ------------------------------------------------------------------ |
| The row shadow  | the shadow of the channel sign inside a messenger row              |
| The hover tint  | the background of a row under the pointer                          |

### What it is called in the interface

| In the spec    | On the screen                                               |
| -------------- | ----------------------------------------------------------- |
| The row shadow | the soft shadow around the round channel sign of a guest    |
| The hover tint | the light grey background of a conversation under the mouse |

## Rules

- **On a narrow place the row shadow of the messenger look blurs by 10.** It fits the row inset, so
  it is seen whole at the first, the last and every row; the rows and the insets stay as they are.
- **Wider than the narrow threshold the row shadow is the sign's own, 24.**
- **The hover tint exists only where a pointer hovers.** On a touch screen a tapped row keeps its
  resting background.
- **The selected row keeps its own background in every case.** The hover tint never replaces it.

## What is out of scope

- **The row shadow of the default look.** Its sign is smaller, and the request names the messenger
  look only.
- **Releasing the kit version.** The consumer releases it.

## Mockup

Figma, file `vyV42sJXccfKNG8yFSCpSL`, node `8056-1850`: the list at 375 now and with the narrower
row shadow.
