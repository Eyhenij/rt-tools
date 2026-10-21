# Grill

## The owner request

> Задача в кит, делаю сам (Рекомендую)

The answer was given to the question about a defect found in a consumer application: the copy cell
shows the hint with the whole value only from the second hover. The first time the pointer comes
in, a cut e-mail in a bookings table cannot be read.

## What the tree already has

- `rt-copy-cell` measures the cut on its host's `mouseenter` and puts the whole text into the
  `hint` signal; the content span carries `[rtTooltip]="hint()"`.
- `RtTooltipDirective.show()` checks its text right at the `mouseenter` of the span and does
  nothing when it is empty. The signal set by the host reaches the directive input only at the next
  change detection, after both events.
- The test of the cell calls `fixture.detectChanges()` between the hover and the reading of the
  text, so it is green on the defect.
- The subdomain `tooltip-when-truncated` describes the tooltip mode; no spec describes the cell.

## What the rules already say

- `overflowing-text`: a text longer than its place declares what happens to what does not fit.
  The cell declares an ellipsis and a hint, and the hint must be reachable.

## Questions and answers

**Как чиним подсказку ячейки с копированием?**
Задача в кит, делаю сам (Рекомендую)

## Decisions

- **The cell updates its own view right after the measurement.** The browser sends `mouseenter`
  to the outer element first, so the host measures before the span asks its tooltip for text. A
  synchronous update of the cell's view puts the text into the directive input in between.
  Rejected: letting the directive schedule a showing for an empty text — it touches every tooltip
  of the kit for the sake of one consumer.
- **The test hovers the way the browser does: host, then span, with no change detection between.**

## What is left unclear

- Nothing.
