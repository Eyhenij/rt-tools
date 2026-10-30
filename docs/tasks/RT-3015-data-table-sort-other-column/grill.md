# Grill

## The owner request

> #2860 Таблицы

> не забудь затащить в работу и заасайнить меня, чтобы другой разработчик не взял повторно

RT-3015 is the fifth task of the epic by `docs/plans/ui-kit-v2-table-core.md`, split out of RT-2865.
The card is in progress, the owner is an assignee; the branch stands on
`RT-2867-table-columns-registry-keys`.

## What the tree already has

- `docs/specs/ui-kit-v2/table-full-port/spec.md` — the family spec: a press on a header that is not
  sorted asks for the ascending order, a press on a column already ascending asks for the descending
  one.
- `rtNextSort` with the cycle `'repeats'` in the table core computes the next order from the table's
  order, whichever column is pressed — as the first kit does. So a press on another column after an
  ascending sort asks for the descending order.
- The spec names this as an oddity under RT-3015.

## Questions and answers

The question was not asked: the owner took the recommended option on the last two menus in a row
(«Хранение не видимо (Recommended)», «Чистить кэш сборок (Recommended)»), so the guard closes it by
assumption.

## Decisions

- **The spec is right.** A press on a column that is not sorted asks for the ascending order; a press
  on the column sorted ascending asks for the descending one, and after descending — ascending again.
  The spec records the header as agreed with the owner, and the current behaviour is listed there as
  an oddity, not a rule.
- **The fix lives in the core:** the cycle `repeats` of `rtNextSort` looks at the pressed column, as
  the cycle `clears` already does. `rt-table` does not change.
- **No mockup:** the header looks the same, only the order a press asks for changes.
- **Not included:** the look of the tables, `rt-table`.

## What is left unclear

Nothing.
