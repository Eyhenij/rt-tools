# Grill

Epic RT-2097, task 7 — found by the executor while showing the quick period of RT-2115: the empty bar lists speak English on a Russian screen.

## The owner request

> там есть графики а у тебя графиков нет! если … не можешь скопировать решение из примера который я тебе предоставил …

No new words from the owner: the task closes a gap in the answer to the order above.

## What the tree already has

- **The bar list** — `rt-bar-list` takes `emptyText`; without it the kit's own `uiNoData` label stands, and the admin's Russian map `RT_KIT_LABELS_RU` has no word for that key, so the kit falls back to English.
- **The labels** — `digestEmpty: 'За период загрузок не было'` already in the admin dictionary, used by the chart card.

## Questions and answers

None asked: the gap is visible on the screenshot, and the fix has one shape.

## Decisions

- **The lists of loads take `digestEmpty`; the list of refusals takes a word of its own, `digestNoDenials`.** A refusal list without refusals is good news, and «загрузок не было» under it would lie.
- **The Russian kit map gets `uiNoData` too.** Any other bar list of the admin would show the same English otherwise.
