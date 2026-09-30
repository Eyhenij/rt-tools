# Grill

## The owner request

> иконка скачать сделай как в первом ките только опционально круглая или квадратная и она немного выходит за край картинки какбы накладывается

Said on 30 September 2026 while the owner compared the uploader of the second kit with the first
kit's story.

## What the tree already has

- The first kit, measured in its showcase: the picture 200×200 sits in a container with an inset
  of 8 px; the download button is 36×36, round, transparent with a blur behind it, pinned to the
  container's top right corner. So it reaches 8 px past the picture's top and right edges.
- The second kit: the button is `rt-icon-button` inside the picture, set 4 px off the corner, with
  a square rounding and a light backing.
- `rt-icon-button` already has the input `shape` with `circle` and `square`.

## What the rules already say

- `reuse-first`: the kit's own icon button is taken as is; its `shape` gives both forms.
- `rt-tools-styling`: the place of the button is the block's own properties, their default is the
  step.
- `rt-tools-storybook`: a new input is shown at every value at once.
- `spec-driven`: the rule is written into the spec before the code, a new scenario takes the next
  free number — 489, the largest across the branches is 488.

## Questions and answers

No question was put: the owner named the sample and both forms.

## Decisions

- **The button reaches past the picture's corner by the inset of the preview, as in the first kit**
  — the picture gets an inset of `--rt-space-sm`, the button stands in the preview's corner.
- **The form is the input `downloadShape`: `circle` or `square`, `circle` by default** — the owner
  asked for the first kit's look with the form optional. Rejected: square by default, it is not the
  first kit's look.

## What is left unclear

- Nothing that blocks the work.
