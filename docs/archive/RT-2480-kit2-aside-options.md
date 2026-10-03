# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 1 and 30–35: `afterClosed()` of the panel and dialog handles must emit and
complete when the overlay is disposed without `close()`; an `injector` option of the panel whose
destruction closes it; a `closeRequests()` stream of refused closing gestures; a `trapFocus` input of
`rt-aside`; a `pending` input with a spinner over the panel; properties for the header, content and
footer padding, the footer margin, alignment and gap, the title line height and the error box margin;
a `[asideHeaderContent]` slot under the header title.

## What the tree already has

- `RtAsideRef.close()` emits the result at once and disposes the overlay 200 ms later;
  `RtDialogRef.close()` disposes first and emits after. Neither listens to the overlay itself: the
  panel opens with `disposeOnNavigation`, and a navigation disposes it while `afterClosed()` stays
  silent forever.
- The panel's portal injector is a child of the root injector; nothing ties the panel to the
  component that opened it.
- The service refuses Escape and a backdrop click under `disableClose` silently.
- `rt-aside` neither traps nor moves focus.
- The header, content and footer take their padding from `--rt-aside-inset`; the footer aligns its
  two slots apart with a small gap; the title has no line height of its own.
- The first kit names `--rt-aside-header-padding`, `--rt-aside-content-padding`,
  `--rt-aside-footer-padding` and `--rt-aside-header-title-line-height`, read without a fallback.
- The spinner with a backdrop of its own lives in an unmerged change of this epic; the table draws
  its own layer under a spinner while it loads more.

## Decisions

- **Both handles finish on the overlay's detachment when `close()` has not run.** `afterClosed()`
  then emits `undefined` and completes; after `close()` the detachment adds nothing.
- **The owner's injector becomes the portal's parent, and its destruction calls `close()`.** The
  listener leaves with the panel, so a later destruction of the owner does nothing.
- **`closeRequests()` emits every closing gesture the panel did not carry out.** That covers
  `disableClose` and a gesture switched off by the config: in both the user asked to close and the
  panel stayed. It completes with the panel.
- **The focus trap is the CDK one with automatic capture.** It moves focus to `[cdkFocusInitial]` or
  the first control, and returns it when the panel leaves. Off by default.
- **The pending layer is the panel's own element with a spinner, drawn like the table's loading
  layer.** It covers the whole frame and marks it busy. The spinner's backdrop of the other change
  is not merged yet.
- **The properties that the first kit already names get names of their own.** An application holding
  both kits would otherwise paint the second kit's panel with the first kit's values. Padding takes
  the word `inset`, the panel's own word for it; line height takes `leading`, the kit's word.
- **The header content slot is a row under the header row, across the whole header.** An empty slot
  takes no room.

## Decisions along the way

- The owner's destruction closes the panel through the service's per-open stream, not a separate
  subscription: the tree's lint forbids a subscription inside a method, and the stream ends with the
  overlay anyway.
- The focus trap is created by the factory only while the input is on: the CDK directive would
  insert its anchors into every panel, the ones without a trap too.
- Escape and the backdrop are now listened to always, so that a switched-off gesture is reported. A
  panel with Escape switched off now keeps that key from an overlay under it.
