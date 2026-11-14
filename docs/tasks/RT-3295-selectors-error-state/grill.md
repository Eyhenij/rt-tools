# Grill

## The owner request

The third task of the epic RT-3288, set by the consumer session on the owner's word about the epic
split: «Эпик, первой thread-list (Recommended)». The task body:

> Селекторы и местные списки кита рисуют «ничего не найдено» своей разметкой, и свой вид туда не подставить. `rt-dynamic-selector` и `rt-autocomplete` грузят данные с сервера, но ошибку не показывают. У `rt-pdf-viewer` ошибка своя, и подменить её нельзя.
>
> Сделать:
> - `rt-dynamic-selector`, `rt-autocomplete`: вход `error`, событие `retry`, оба слота; вход `emptyTemplate` остаётся рабочим;
> - `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`, `rt-tree-selector`, `rt-side-menu`: слот пустого состояния;
> - `rt-pdf-viewer`: слот ошибки.
>
> Готово, когда: кадры, витрина и одобрение владельца есть по каждому компоненту.

Owner words on the mockups of this task:

> Одобряю

— the frames of RT-3294 and RT-3295, 13.11.2026.

## What the tree already has

- The contract of the epic is merged twice: `docs/specs/ui-kit-v2/error-states/` for the
  conversation components and `docs/specs/ui-kit-v2/error-states-lists/` for the table and the
  lists. The helper `rtLoadErrorView` next to `rt-empty-state` gives the title, the hint and the
  template context of an error.
- `rt-dynamic-selector` has `loading` and `emptyResultsText`; no error, no retry, no template.
- `rt-autocomplete` has `loading`, `emptyText` and the input `emptyTemplate`; no error, no retry.
- `rt-tree`, `rt-draggable-tree` and `rt-tree-selector` have `emptyIcon`; `rt-select`,
  `rt-multiselect` and `rt-side-menu` have no empty input at all.
- `rt-pdf-viewer` draws its own error markup and takes no template.
- The approved frames of RT-3295 lie in the kit Figma file next to the RT-3294 frames.

## What the rules already say

- The order of the epic: `error !== null` → the error; otherwise loading without rows → the
  skeleton; otherwise empty → the placeholder.
- A visible kit edit: approved mockup, code, every state in the showcase, the showcase approved,
  then references, push, PR and release (rule `kit-approval`).
- Questions go to the consumer session; the owner gives the mockup and the showcase approvals.

## Questions and answers

No question is asked yet: the contract and the frames are approved, the order is written.

## Decisions

- **The branch stands on the RT-3294 branch** — the chain of the epic; RT-3292 and RT-3294 are not
  on the remote yet: the push set time limit is asked of the consumer session on 14.11.2026.
- **The input `emptyTemplate` that stays working is the one of `rt-autocomplete`** — the task body
  names it next to both server selectors, and only the autocomplete has it in the tree; the
  directive slot wins over it the same way the table directive wins over `#rtTableEmpty`.

## What is left unclear

- The names of the empty slot of the six local components: read from the approved frames before
  the agreement.
