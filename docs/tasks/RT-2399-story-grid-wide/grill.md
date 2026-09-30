# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было мерж-конфликтов

The task in the queue: the grid of the second kit's showcase clips a table wider than the window at
the edge of the frame. The columns past the edge do not reach the frame, and the frame does not show
that they are missing. The frame has to hold the whole grid or show plainly that it is clipped. Then
the radius grid goes back into two stories: controls and surfaces. Checked by a frame of a grid of
ten columns of 160px that shows all ten.

## What the tree already has

- The snapshots spec `docs/specs/ui-kit-v2/snapshots/spec.md` says the frame takes the drawn span
  and cuts it by every ancestor that scrolls. The harness grows the window to the right edge of
  that span.
- The grid helper `projects/ui-kit-v2/src/showcase/story-grid.component.ts` wraps its table in a
  block with horizontal scroll. That block is such an ancestor: it cuts the span at the window
  width, so the window never grows and the columns past the edge leave the frame.
- The radius grid is split into six stories of three or four columns by
  `projects/ui-kit-v2/src/showcase/stories/component/test-radius-columns.ts`.

## What the rules already say

- `rt-tools-storybook`: a frame is taken by the drawn span, and the window grows to its edges.
- `ui-component-tests`: a reference is re-taken after the frame is looked at, and confirmed by a
  second raising.

## Questions and answers

No questions: the task names what to do and how it is checked.

## Decisions

- **The frame holds the whole grid.** The grid stops scrolling its matrix inside itself. A wide
  grid widens the page, and the harness grows the window to it. Rejected: a mark that the grid is
  clipped. The frame would still miss the columns, and the task asks to see them.
- **The harness is not changed.** Its rule about scrolling ancestors is right for a component's own
  scroll. The miss is in the grid helper, which scrolled where nothing asked it to.

## What is left unclear

- A story that names a width threshold keeps its pinned window, and a grid wider than that window
  is still clipped there. It does not block this work: the task names the base frame.
