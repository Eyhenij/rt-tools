# Grill

Former address: docs/tasks/RT-2788-kit2-tooltip-keep-on-click/grill.md

The second kit's tooltip got the input `rtTooltipHideOnClick`, `true` by default: with `false` a
click leaves an open tooltip open. A new `[rtTooltip]` text reaches an open panel in place, and an
emptied text hides it. A tap still shows nothing: the click clears the pending showing. The icon
button passes the input through as `tooltipHideOnClick`. The rules live in the subdomain spec
`docs/specs/ui-kit-v2/tooltip-keep-on-click/`, SC-UKV-850…855. Checks: six new tests, the story
`KeepOnClick` with its frame, the full frame run 839 of 839.

## The owner request

> сделай в этот эпик, заасайни на меня

It pointed at a request of the application's session: the application moves from the Material
tooltip to the kit's, and its toggles ("turn on / turn off", "light / dark theme", "pin / unpin",
"copy → copied") lose the tooltip with the new state after a click. The request named three points:
an input such as `rtTooltipHideOnClick` with `true` by default, the text changed in place while the
panel is open, and no change on touch screens, where a tap must show no tooltip.

## Decisions

- **The input is `rtTooltipHideOnClick`, default `true`.** — The name the request offered; the
  default keeps every present consumer unchanged.
- **A click with `false` still clears a pending show timer.** — A tap gives mouseenter and click
  together; the click cancelling the timer keeps touch without a tooltip.
- **The text reaches an open panel by an effect on the text input, whatever the input says.** — A
  reopening would flash the panel and run the delay again; limiting the update to `false` would
  leave a stale text under the default.
- **`rt-icon-button` passes the input through, `rt-menu-item` does not.** — The application's
  toggles are icon buttons and their inner button is out of reach; a menu closes on a click of its
  item.

## Decisions along the way

- **The story clicks by a bare `click` event.** — The helper's default gesture focuses each trigger
  in turn, and the focus leaving the previous button hid its tooltip by `focusout`.
- **The live click through the browser driver was not taken.** — In that tab the driver's click
  reached no page listener at all, while its hover did; the tests and the story's `play` cover it.
- **The four icon frames were re-taken by a commit of their own, and carried onto the epic branch.**
  — Main had re-taken them with the icon `folder`, and the merge of main into the epic left the
  epic's frames without it.
