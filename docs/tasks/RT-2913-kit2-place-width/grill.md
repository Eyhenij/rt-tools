# Grill

## The owner request

> шарина контента становится меньше но при этом меню и вообще весь ui контента продолжает
> показываться как для десктопа

The owner speaks of the assistant panel opened next to the content.

## What the tree already has

- `BreakpointsService` answers by the window through the CDK breakpoint observer. Its `narrow`
  signal is read by the table, the page header, the side menu, the filter control, the
  breadcrumbs, the data table cell, the date picker, the date range and the selector list.
- Twenty component styles switch their look by `@media (width …)` against the window.
- Container queries already stand in the pagination and the file drop, both unnamed and local.
- `rt-container` is the page frame: header, toolbar, sidenavs and content all lie inside it. A
  side panel next to it narrows the content and leaves the window as it was.

## What the rules already say

- The kit rules ask a narrow layout to be measured on both sides of 480, 768, 1080 and 1380. They
  say nothing about what width those thresholds count from.

## Questions and answers

**What switches by the width of the place?**
Всё, что рисует кит (Рекомендую)

**What does the header do when the content narrows?**
Сужается с контентом (Рекомендую)

## Decisions

- **The page frame declares itself a named container `rt-place`, and the document root declares
  the same name.** A component inside the frame counts its thresholds from the frame width. A
  component outside it counts from the root, which is the window width. So a consumer without the
  frame keeps today's look. Rejected: an unnamed container on the frame, because the nearest
  container of any kind would answer, and the pagination already is one.
- **Styles move from `@media` to `@container rt-place` through one mixin.** The thresholds stay
  the same numbers. Rejected: writing the query by hand in every file, because twenty copies drift.
- **Overlays stay on the window: the dialog popup, the toast, the aside and the photo viewer
  keep `@media`.** An overlay lies outside the frame and covers the window, so the window is its
  place anyway. The frame's own mobile layout stays on `@media`: a container cannot query itself.
- **`narrow` answers by the width of the registered page frame, and by the window without one.**
  The frame registers its host on creation and leaves on destruction. A new `viewportNarrow`
  signal answers by the window for the date picker, the date range and the selector list. They
  choose between a popover and a bottom sheet, and that choice belongs to an overlay.

## What is left unclear

- The root container counts its width without the window scrollbar, while `@media` counts with
  it. On a window with a classic scrollbar a threshold moves by its width. It does not block the
  work: the look on both sides of the threshold is the same as before.
