# Grill

Former address: docs/tasks/RT-2924-place-root-background/grill.md

## The owner request

> и выпусти новые версии пакетов если это требуется

The release `@rt-tools/ui-kit-v2@0.29.0` went out in that turn. Merging the main branch into the
epic branch then turned the admin end-to-end suite red: the page background ends under the
content, and white lies below it.

## What the tree already has

- The kit declared the document root the container `rt-place`. It came with RT-2913 so that a
  component outside `rt-container` counts its thresholds from the window.
- The mixins `place-max` and `place-min` emitted only `@container rt-place`.
- The spec of the page place has the rule «Without the page place the thresholds count from the
  window».
- The admin sets the page colour on `body`.

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

- **The root declaration goes, and the mixins carry a window fallback for a page without the
  frame.** Rejected: the declaration on `body` — it breaks the background the same way; a
  background on the root painted by the kit — the kit does not set the page colour of a consumer.

## What is left unclear

- Nothing blocks the work.

## Decisions along the way

- **The fallback stands as an ancestor, `:where(html:not(:has(.rt-container)))`, not on the node
  itself.** A condition on the node, `&:where(:not(.rt-container &))`, glues the nested
  `&__element` rules of `@content` to the `:where` and breaks them: eight components nest such
  rules inside the mixin. The cost: a kit component outside the frame on a page that has one gets no
  window threshold; the spec names it out of scope.
- **The toolbar call needed no edit.** The ancestor form works for a call without a parent
  selector too.
- **A selector inside the mixin holds one `&`.** Every `&` carries the fallback condition, so the
  header's `&__link &__icon` repeated it inside the link and never matched: four header frames
  showed icons below 1380px. The second class is written out in letters.
- **Checked by:** the admin end-to-end suite — 144 passed, 2 failed on the Keycloak sign-in and
  passed on a rerun; the second kit's frames — 899 of 899.
