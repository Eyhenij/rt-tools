# The tooltip that stays on a click

**Status:** in force · **Revision:** 28 October 2026 · **Scenario prefix:** `SC-UKV`
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
- **With `rtTooltipShowOnTap` a tap opens the tooltip at once.** The input is for a host with no
  action of its own: an icon or a ring whose tooltip is what a person taps it for. A button does not
  set it: its tap performs the action.
- **A second tap on the host or a tap outside it closes a tooltip opened by a tap.**
- **`rt-usage-ring` sets `rtTooltipShowOnTap` on its ring.** A phone has no hover, and the hint of
  the ring carries the share of the limit and the reset date.

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
| `rtTooltipShowOnTap`, a tap on the host     | the tooltip opens at once; a second tap closes it |
| `rtTooltipShowOnTap`, a tap outside         | the open tooltip closes                           |

## Cross-cutting requirements

### Locales

Not applicable: the behaviour adds no labels; the text arrives from the caller.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

A tap shows no tooltip, with either value of the input: the click clears the pending showing. A host
with `rtTooltipShowOnTap` is the exception: its tap opens the tooltip without the delay.

### Several objects

Every host decides apart: a toggle that keeps its tooltip and a button that hides it stand in one
row.

## Decisions

- **The input is `rtTooltipHideOnClick`, default `true`.** The name the application's request
  offered; the default keeps every present consumer unchanged.
- **The text reaches the panel by an effect on the text input, not by reopening the panel.** A
  reopening would flash the panel and run the delay again.
- **A tap opens a tooltip only on a host that asked for it — `rtTooltipShowOnTap`, default
  `false`.** Task RT-2980, the owner's word of 28 October 2026: «Только у элементов без действия».
  Rejected: a tap opening every tooltip of the kit. On a button the tooltip would cover the result of
  the press.

## Open questions

None.

## History of changes

- 12 October 2026 — written together with the code by task RT-2788 from the application's request.
- 28 October 2026 — task RT-2980: `rtTooltipShowOnTap`, a tap opens the tooltip of a host without an
  action; the usage ring sets it.
