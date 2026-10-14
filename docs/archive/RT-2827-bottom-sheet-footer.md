# Grill

Former address: docs/tasks/RT-2827-bottom-sheet-footer/grill.md

Task RT-2827, request https://github.com/Eyhenij/rt-tools/issues/2827. `rt-bottom-sheet` got a body
that scrolls by itself and a `[sheetFooter]` slot under it that does not; the panel limit became the
property `--rt-bottom-sheet-max-height` with the default `80vh`. Checks: the sheet specs 24 of 24,
the sheet's showcase frames 6 of 6 with the new `Footer` reference.

## The owner request

> у шторки кита нет закреплённого подвала; добавить подвал, чтобы кнопки стояли внизу

Task: [RT-2827](https://github.com/Eyhenij/rt-tools/issues/2827) «Кнопки внизу шторки уезжают
вместе с содержимым».

## What the tree already has

- `rt-bottom-sheet` draws its panel as a flex column with `max-height: 80vh`: the handle, the header
  (slot `[sheetHeader]`) and the default content stand in it directly. The content has no scroll of
  its own, so buttons put at the end of the content leave together with it, and long content runs
  out of the panel.
- `rt-aside` already keeps the same arrangement: a header and a footer that do not shrink, and one
  content zone between them with `flex: 1 1 auto`, `min-height: 0`, `overflow-y: auto` and
  `overscroll-behavior: contain`. That is the sample taken here.
- The swipe starts only on the handle: `pointerdown` is listened on the handle element alone, the
  move and the release on the document.
- The package changelog is written by `changelog:ui-kit-v2` from the commits at release; nothing is
  added to it by hand.

## What the rules already say

- Every interactive and anchoring element of a kit template carries `qa-dataid`.
- Spacing and lines come from the kit tokens: `--rt-space-*`, `--rt-border-width-thin`,
  `--rt-color-border-default`.
- A state the snapshot does not reach by itself gets a story of its own, and a new story needs its
  reference taken.

## Questions and answers

**Where the fix goes — into the kit or into the consuming screen?**
«PR в кит (Рекомендую)»

## Decisions

- **The default content is wrapped in a body element `rtElem="body"` that scrolls by itself** —
  only then the header and the footer stay in place at any content length. Rejected: scrolling the
  whole panel — the footer would scroll away with the content.
- **The body is a flex column** — before the wrapper the content stood straight in the column of
  the panel, and the column keeps its layout as it was: the existing showcase frames do not move.
- **A new slot `[sheetFooter]` in an element `rtElem="footer"` after the body** — it does not
  shrink, takes the header's spacing on the kit scale, adds `env(safe-area-inset-bottom)` at the
  bottom and is separated by a thin line on top. The projected items stand in a row with a gap.
- **An empty footer is hidden by `:empty`** — Angular removes whitespace-only text nodes from the
  template, so with nothing projected the element has no child nodes; the spec checks exactly
  that. Rejected: a `contentChild` flag with a modifier — an extra input of state for what CSS
  already sees.
- **The swipe stays on the handle** — the footer and the body never start a drag; a spec pins it.
- **The changelog is not edited by hand** — it is generated from the commit at release.

## What is left unclear

- Nothing blocks the work.

## Decisions along the way

- **The footer is a flex row with a gap** — a switch and two buttons stand in one line without a
  wrapper of the consumer; pushing the buttons right is `margin-inline-start: auto` on the first,
  named in CONTEXT.md. Affected stage of the plan: 1.
- **The footer wraps** — the first frame of the Footer story showed the last button cut off by the
  panel edge: a flex row without wrapping does not shrink buttons and runs out of a narrow panel. On
  a phone the same would hide an action. Affected stage of the plan: 1.
- **The panel limit became the property `--rt-bottom-sheet-max-height` with the default `80vh`** —
  `80vh` is counted from the window, and in the tall showcase frame the panel came out higher than
  its box: the box cut off the handle and the header, and the frame did not show the panel stopping
  at its limit. The property is read with a fallback rather than declared on the block, so a value
  set on an ancestor reaches the panel. Rejected: a taller box — the frame height moves the window
  height, and the limit with it. Affected stage of the plan: 2.
