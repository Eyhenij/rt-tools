# Grill

## The owner request

> открой в браузере https://message-bus.dev/usage, почему я не могу прочитать эту страницу?

> заведи новое независимое рабочее дерево и делай правки там

## What the tree already has

- The section «Использование» opens with the tree filter set to «Все проекты». The table then asks
  `GET /api/usage` without `tree`, and the receiver answers `404 treeUnknown` with an empty sign.
  With a tree named, the same request answers 200 — measured on the rollout of 8 November.
- `libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts` — `#asked` refuses an
  empty sign; `/api/usage`, `/api/usage/digest` and `/api/usage/:skill/sessions` all go through it.
- `/api/usage/quality` already reads all trees when no tree is named.
- The digest store on the screen skips the read when the tree is empty; the table store does not.
- The tree filter is the shared `AdminTreeFilterComponent`: an empty value means all trees there.

## What the rules already say

- The usage spec: "The filters are the tree and the period … The tree is chosen from the list of
  the created trees". It names no case for "all trees".

## Questions and answers

**How to fix: the receiver reads all trees without `tree`, or the filter loses «Все проекты»?**
The owner was shown both with the first recommended and answered «заведи новое независимое рабочее
дерево и делай правки там» — the recommended way is taken.

## Decisions

- **Without `tree` the three usage reads count over all trees** — the shared filter already offers
  «Все проекты», and the quality section reads the same way. Rejected: removing the option from this
  section only — the filter is shared, and the section would differ from its neighbours.
- **A named sign that is not found is still `404 treeUnknown`** — a typo in the address must not
  read as "all trees".
- **The digest is read with an empty tree too** — otherwise the cards stay empty over a filled table.

## What is left unclear

- Nothing blocks the work.
