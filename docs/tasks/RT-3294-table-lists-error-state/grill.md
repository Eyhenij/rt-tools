# Grill

## The owner request

The second task of the epic RT-3288, set by the consumer session on the owner's word about the epic
split: «Эпик, первой thread-list (Recommended)». The task body:

> Таблица и списки кита (`rt-table`, `rt-data-list`, `rt-dynamic-list`, `rt-bar-list`) не показывают ошибку загрузки. Пустое состояние подменяется по-разному: у таблицы `#rtTableEmpty`, у остальных никак.
>
> Сделать: контракт эпика у этих четырёх компонентов — вход `error`, событие `retry` и слоты `rt<Компонент>Empty` и `rt<Компонент>Error`. `#rtTableEmpty` остаётся рабочим.
>
> Готово, когда: кадры, витрина и одобрение владельца есть по каждому компоненту.

Owner words on the mockups of this task:

> Одобряю

— the frames of RT-3294 and RT-3295, 13.11.2026.

## What the tree already has

- The contract of the epic is written and merged for the conversation components:
  `docs/specs/ui-kit-v2/error-states/`. The shared helper `rtLoadErrorView` lies next to
  `rt-empty-state` and gives the title, the hint and the template context of an error.
- `rt-table` has `loading`, `fetching`, `emptyMessage`, `emptyIcon`, `emptyDescription` and the
  template `#rtTableEmpty` read by `contentChild('rtTableEmpty')`; no error input, no retry.
- `rt-data-list` has `loading` and `fetching`; no empty texts, no error.
- `rt-dynamic-list` has `loading`, `fetching`, `empty`, `emptyTitle`, `emptyDescription`; no error.
- `rt-bar-list` has `emptyText` only.
- The approved frames of RT-3294 lie in the kit Figma file next to the RT-3292 frames.

## What the rules already say

- The order of the epic: `error !== null` → the error; otherwise loading without rows → the
  skeleton; otherwise empty → the placeholder. A load more error keeps the rows.
- A visible kit edit: approved mockup, code, every state in the showcase, the showcase approved,
  then references, push, PR and release (rule `kit-approval`).
- Questions go to the consumer session; the owner gives the mockup and the showcase approvals.

## Questions and answers

No question is asked yet: the contract and the frames are approved, the order is written.

## Decisions

- **The branch stands on the RT-3292 branch** — the chain of the epic; RT-3292 is not on the
  remote yet because the push set does not let a kit change through (the question about the set
  limit went to the consumer session on 14.11.2026).
- **`#rtTableEmpty` keeps working next to the new `rtTableEmpty` directive** — the task body says
  so; consumers of the published kit use the reference name.

## What is left unclear

- Whether `rt-data-list` and `rt-bar-list` get a load more error row: their frames decide; read
  before the agreement.
