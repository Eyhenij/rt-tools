# The tooltip that stays on a click

**Status:** in force · **Revision:** 12 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tooltip of the second kit — the behaviour is an input of `[rtTooltip]`
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-2788 together with the code.

## Why

A toggle button names its next action in the tooltip: "turn on" and "turn off", "light theme" and
"dark theme", "copy" and "copied". The tooltip of the second kit hides on every click and takes its
text once, when it opens, so after a click a person sees no tooltip with the new state until the
pointer leaves and comes back. The application moving to the kit from the Material tooltip loses
exactly this: the Material tooltip stayed and changed its text in place.

## Terminology

| Term            | What it is                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| the host        | the node that carries `[rtTooltip]`                                                |
| an open tooltip | the panel is shown: the pointer or the keyboard focus came in and the delay passed |
| a tap           | a touch on a touch screen: the browser sends the pointer in and a click together   |

### What it is called in the interface

A person sees the same tooltip panel; the input decides only whether a click hides it.

## Rules

- **By default a click hides the tooltip, as before.** A consumer that never sets the input sees no
  change.
- **With `rtTooltipHideOnClick` false a click leaves an open tooltip open.**
- **A click clears a pending showing whatever the input.** A tap is the pointer coming in and a
  click at once, so the delay never passes and a tap shows no tooltip.
- **A new text reaches an open tooltip in place.** The panel shows the new text without a new
  hover, and its position is recomputed for the new width.
- **A text that becomes empty while the tooltip is open hides it.** An empty text shows nothing, open
  or not.
- **`rt-icon-button` passes the input through as `tooltipHideOnClick`.** Its inner button carries the
  directive, and the consumer cannot reach it.

## What is out of scope

- `rt-menu-item` gets no passthrough: a menu closes on a click of its item, and the tooltip with it.
- A global default for every tooltip of an application: the request is per host.

## Contract

Not applicable: the surface is one input of a kit directive, the subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the behaviour keeps nothing.

## Screens and states

| State                                       | What is visible                                   |
| ------------------------------------------- | ------------------------------------------------- |
| input false, the tooltip open, a click      | the tooltip stays, with the text of the new state |
| input by default, the tooltip open, a click | the tooltip hides                                 |
| a tap on a touch screen                     | no tooltip with either value                      |

## Cross-cutting requirements

### Locales

Not applicable: the behaviour adds no labels; the text arrives from the caller.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

A tap shows no tooltip, with either value of the input: the click clears the pending showing.

### Several objects

Every host decides apart: a toggle that keeps its tooltip and a button that hides it stand in one
row.

## Decisions

- **The input is `rtTooltipHideOnClick`, default `true`.** The name the application's request
  offered; the default keeps every present consumer unchanged.
- **The text reaches the panel by an effect on the text input, not by reopening the panel.** A
  reopening would flash the panel and run the delay again.

## Open questions

None.

## History of changes

- 12 October 2026 — written together with the code by task RT-2788 from the application's request.
