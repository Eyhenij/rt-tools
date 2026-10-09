# Grill

## The owner request

> делай

The word answers the proposal: carry the commits of rows 122–132 onto a fresh branch from main and
open a PR into main, author treble3d, reviewer Eyhenij. The question before it:

> ты открыл пр на правки запрос от апки?

And the next one, asked while the work was going on:

> если запаблишить мейн после пр с запросами и запаблишить все запросы апки там будут?

## What the tree already has

- PR #2647 of RT-2644 is merged into main by a squash; its head was `ea9e90965`. Task #2644 is
  closed, and the delivery guard refuses work behind a closed task.
- Seven commits of the branch `RT-2644-kit2-selector-popup-look` came after that head and are not in
  main: the first kit's look of the side menu (`be09487bc`) and rows 122–132 (`7941fc8d5`,
  `33ce4622f`, `298e4dc7b`, `fe34ee7af`, `26781ffa3`, `5469769fa`).
- The same branch carries the merges of the epic RT-2542, so a PR from it would bring the epic's
  unfinished trees into main.
- The application consumes the package built from that branch; it uses none of the epic's trees.

## What the rules already say

- Work behind a closed task is created as a new task.
- A commit lands with its final content; frames that came from another base are retaken.

## Questions and answers

None beyond the owner's word above.

## Decisions

- **The seven commits are picked onto a branch from main.** Rejected: a PR from the RT-2644 branch,
  which brings the epic along.
- **The four icon frames take main's side and are retaken.** The branch frames carry the epic's icons,
  which main does not have.

## What is left unclear

- Nothing blocks the work.
