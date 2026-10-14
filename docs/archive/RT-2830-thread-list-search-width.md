# Grill

Former address: docs/tasks/RT-2830-thread-list-search-width/grill.md

Task RT-2830, request https://github.com/Eyhenij/rt-tools/issues/2830. The search field of
`rt-thread-list` lost its `max-inline-size: 400px` and now takes the whole head up to the filters
button. Checks: the second showcase's frames 883 of 884 matched the old references; the one that
diverged, `organisms-chat-threadlist--playground`, differed by the search width alone and was
re-taken by a pointed call and looked at by eye.

## The owner request

> почему инпут поиска на списке диалогов не на всю ширину? исправь в самом ките

Task: [RT-2830](https://github.com/Eyhenij/rt-tools/issues/2830) «Поиск в списке бесед не
растягивается на всю ширину шапки».

## What the tree already has

- The head of `rt-thread-list` is a flex row 56px high: the search with `flex: 1 1 auto` and the
  filters button that does not shrink. The search also carried `max-inline-size: 400px`, so in a
  column wider than about 450px an empty strip stayed to the right of it.
- No spec of the component checks the 400px limit.
- The package changelog is written by `changelog:ui-kit-v2` from the commits at release; nothing is
  added to it by hand.

## What the rules already say

- A changed look is confirmed by the showcase frames, and the references are re-taken by a separate
  call and looked at by eye.

## Questions and answers

**Where the fix goes — into the kit or into the consuming screen?**
«исправь в самом ките»

**Does the mockup frame of the list in a 720px panel with the search across the whole head fit?**
«Одобряю, делай PR (Рекомендую)»

## Decisions

- **The limit is removed, not raised** — the head has nothing else to give the width to, and any
  number leaves the same strip in a wider column. Rejected: a property for the limit — no consumer
  needs a narrower search, and the template slot `[rtThreadListSearch]` already replaces the field
  whole.
- **CONTEXT.md names the behaviour among the edges** — a reader of the component learns that the
  search has no width limit.
- **The changelog is not edited by hand** — it is generated from the commit at release.

## What is left unclear

- Nothing blocks the work.
