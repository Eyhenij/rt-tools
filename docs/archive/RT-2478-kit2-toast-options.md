# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 2 and 20–24: the toaster's layer from a property; a per-toast duration, where
`null` keeps the toast until the close button; a progress strip of the toast's time; colour
properties of the toast and of its filled kinds; a `replace` mode of the toaster; a per-toast icon
and an injectable map of the severity icons.

## What the tree already has

- The toaster stands on the literal layer number 1100, written in its styles file.
- Every toast lives the toaster's `duration`; the toast pauses its timer while the stack is
  expanded or pressed.
- The toast paints its surface, border, text and close icon with direct assignments; the filled
  kinds paint the severity pair directly.
- The severity icons are a private map inside the toast; the icon gets its colour by the
  `color` input, written as an inline style.
- The first kit declares no `--rt-toast*` or `--rt-toaster*` names.

## Decisions

- **The layer is the toaster's own property `--rt-toaster-z-index`, declared on its host with the
  scale step `--rt-z-sticky`.** That step is today's 1100, so nothing moves; a number written in
  place is what the styling rule forbids.
- **`duration` and `progress` are optional fields of the notification options and of the toast
  model.** An absent duration keeps the toaster's; `null` starts no timer at all.
- **The progress strip is a CSS animation of the toast's own lifetime.** It is paused by the same
  state that pauses the timer, so the two never drift. A toast without a timer draws no strip.
- **The colour properties are consumer handles read with a fallback.** An application sets them
  on the page root or on the toaster. The filled kinds read three handles per severity —
  background, text and border; their icon follows the text, as it does today.
- **`--rt-toast-action-color` is the fill of the main action.** The main action is a solid
  button; its label colour stays the kit's.
- **`replace` lets the previous toasts leave by their own exit animation.** The new toast
  enters while the old ones leave, instead of the old ones vanishing.
- **`icon: null` draws no icon; the severity map is the token `RT_TOAST_SEVERITY_ICONS` with
  today's map as its default.**

## Decisions along the way

- The icon no longer takes its colour by the icon's `color` input, which writes an inline style no
  rule can override. The toast paints it from a private severity colour, read under the icon handle.
- The strip's lifetime is the internal `--lifetime`, like the stack's `--offset`: the toast writes it
  from its own binding, and it is no handle.
- Measured in the showcase: at 3 s of 6 s the strip is 177 of 354 px; hovering the stack pauses
  its animation and leaving resumes it; the toaster layer computes to 1100.
- Snapshots: two written (toast Options and Handles); 746 frames of 746 matched in the full audit,
  and the sweep found no empty showing among 728 stories and 92 overview pages.
- The filled kinds keep their icon on the text colour, so the filled text handle repaints both.
