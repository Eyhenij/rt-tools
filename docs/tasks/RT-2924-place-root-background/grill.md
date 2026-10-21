# Grill

## The owner request

> и выпусти новые версии пакетов если это требуется

The release `@rt-tools/ui-kit-v2@0.29.0` went out in that turn. Merging the main branch into the
epic branch then turned the admin end-to-end suite red: the page background ends under the
content, and white lies below it.

## What the tree already has

- `projects/ui-kit-v2/src/styles/_place.scss` declares the document root the container `rt-place`.
  It came with RT-2913 so that a component outside `rt-container` counts its thresholds from the
  window.
- `projects/ui-kit-v2/src/styles/_breakpoints.scss` holds the mixins `place-max` and `place-min`:
  they emit only `@container rt-place`.
- The spec `docs/specs/ui-kit-v2/place-width/` has the rule «Without the page place the thresholds
  count from the window».
- The admin sets the page colour on `body` (`apps/message-bus-admin/src/styles/_base.scss`).

## What the rules already say

- The browser propagates the background of `body` to the whole window only while neither the root
  nor `body` carries containment. A container declaration applies containment. Measured in the
  browser: `body` with a background and 50px of content paints a 400×300 window whole without the
  root rule, and only the first 50px with it; the same holds for the declaration on `body`.

## Questions and answers

**Is this work the owner's word?**
Question closed by assumption: the owner ordered releasing packages, and the released edition
breaks every application page. Fixing it is part of that order.

## Decisions

- **The root declaration goes, and the mixins carry a window fallback for nodes outside
  `.rt-container`.** The fallback is `@media` under `&:where(:not(.rt-container &))`, so it adds
  no specificity. The spec rule stays as it is. Rejected: the declaration on `body` — it breaks the
  background the same way; a background on the root painted by the kit — the kit does not set the
  page colour of a consumer.

## What is left unclear

- Nothing blocks the work.
