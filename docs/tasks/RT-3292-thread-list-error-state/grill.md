# Grill

## The owner request

The work came from the consumer session that leads the messenger screens, on the owner's word about
the epic split: «Эпик, первой thread-list (Recommended)». The task: one contract for the error and
placeholder states of the second kit — input `error: string | null`, output `retry`, optional slots
`ng-template[rt<Component>Empty]` and `ng-template[rt<Component>Error]`, the default view
`rt-empty-state` with the alert icon and a «Повторить» button, labels through the kit dictionary.

Owner words during the work:

> Одобряю

— the mockups of this task, after three review rounds, 13.11.2026.

> внеси правки в отступы которые ты исправлял на макетах для хедера threads list и для multi button

— the spacing fixed on the mockups goes into the code: the `rt-thread-list` header carries no side
padding beyond the list padding, and the tab switch stands 8 px from the header line and 8 px from
the content.

## What the tree already has

- `rt-thread-list`, `rt-chat` (in `src/rich-editor`) and `rt-workspace-details` have `loading` and an
  empty text; none has an error input, a retry output or slots for its own empty and error views.
- `rt-empty-state` exists with `Framed`, icon, title, description and an action slot.
- `rt-chat` renders `emptyHint()` instead of `emptyHintText()`: the default label `chatEmptyHint`
  never shows.
- The approved frames: Thread List 7899:1537, Chat 7900:2099, Workspace Details 7901:2901 in the kit
  Figma file; the library set Thread List carries the messenger variants with the fixed spacing.

## What the rules already say

- The order: `error !== null` → the error; otherwise loading without rows → the skeleton; otherwise
  empty → the placeholder. An error with rows already shown (load more) is an error row at the bottom
  with the same retry button; the rows stay.
- The default view is `rt-empty-state`: the alert icon, the title is the error text or the label
  `uiLoadError`, the description `uiLoadErrorHint`, a `rt-button` «Повторить» (`uiRetry`) in the
  action slot. New keys go into the English dictionary and the Russian map of the showcase.
- A visible kit edit: mockup and owner approval, then code and every state in the showcase, the
  showcase approved too, then push, PR and release (rule `kit-approval`).

## Questions and answers

Questions go to the consumer session, not to the owner; the owner gives only the mockup and the
showcase approvals.

## Decisions

- **The placeholder texts of `rt-thread-list` are set by inputs, not only by a template** —
  `emptyTitle`, `emptyDescription`, `nothingFoundTitle`, `nothingFoundDescription`,
  `errorDescription`; the error title is the `error` text itself. Rejected: a template only — the
  consumer would repeat the search and filter condition.
- **`rtThreadListEmpty` gets `filtered` in its context** — search or filters are active. One
  template for both empty states.
- **`rtChatEmpty` is «no conversation selected» (`hasThread` false)** — an empty conversation was
  drawn by nobody. `rt-chat` gets `emptyTitle`, `emptyHint` (exists) and `emptyIcon`; the
  `emptyHint()` render is fixed along the way.
- **The placeholder width is 400 by default, variable `--rt-empty-state-max-width`** — the kit
  frames are approved so; the consumer stretches the placeholder to its column without a template.
- **The thread list header has no side padding beyond the list padding; the tab switch sits in a
  wrapper 8 px from the header line and 8 px from the content** — the owner's word above.

## What is left unclear

- Nothing blocks the work.
