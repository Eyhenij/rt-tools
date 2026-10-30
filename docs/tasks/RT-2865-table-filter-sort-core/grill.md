# Grill

## The owner request

> #2860 Таблицы

> не забудь затащить в работу и заасайнить меня, чтобы другой разработчик не взял повторно

> прежде чем открывать пр мне на апрув макеты и сториук, с конкретным указанием где ичто смотреть

The first task of the epic by its plan `docs/plans/ui-kit-v2-table-core.md` is RT-2865: one core of
the filter and the sort for `rt-table` and `rt-data-table`. The card of the epic and the card of the
task are in progress, the owner is an assignee of both.

## What the tree already has

- `projects/ui-kit-v2/src/lib/components/table/rt-table-sort.logic.ts` — `nextSort`: ascending →
  descending → no sort; its own `TRtTableAriaSort`.
- `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-sort.logic.ts` —
  `dataTableNextSortOrder`: ascending → descending → ascending, as in the first kit; its own
  `TRtDataTableAriaSort`, and `null` for a column without a sort.
- `table/rt-table-filter.logic.ts` and `data-table/rt-data-table-filter.logic.ts` — two copies of the
  filter: the first drops a condition only on `''`, the second on any falsy value; «nothing changed»
  is the same array against `null`.
- `docs/specs/ui-kit-v2/table-full-port/` records the owner's word: `rt-data-table` is a copy of the
  first kit's table «as is», the oddities are discussed later.

## What the rules already say

- `kit-approval`: a visible kit edit goes to a Figma frame and the owner's approval first, then the
  code and the showcase measured against it, approved by a second answer.
- `reuse-first`: one implementation, both tables as thin adapters over it.

## Questions and answers

The four open questions of the epic card (comment of 16.10.2026) are asked when the epic is taken.
Question 3 («nothing changed»: the same array or `null`) is an inner interface, not a screen, and is
closed by assumption at the call sites. Question 4 belongs to RT-2867 and is asked there.

## Decisions

- **Before the PR the owner approves the frame and the showcase story, with the exact places to
  look at named.** The owner's word above.
- **Not included:** row selection (RT-2866), column keys (RT-2867), the look of the tables.

## What is left unclear

- Questions 1 and 2 of the epic card — asked of the owner now.
