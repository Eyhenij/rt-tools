# Grill

## The owner request

> #2860 Таблицы

> не забудь затащить в работу и заасайнить меня, чтобы другой разработчик не взял повторно

> прежде чем открывать пр мне на апрув макеты и сториук, с конкретным указанием где ичто смотреть

RT-2866 is the third task of the epic by `docs/plans/ui-kit-v2-table-core.md`. The card is in
progress, the owner is an assignee; the branch stands on `RT-2865-table-filter-sort-core`, as the
plan stacks them.

## What the tree already has

- `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selection.logic.ts` — seven
  functions of row selection, keyed by the record key.
- `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selection.logic.ts` — four
  functions of «select all across pages»; each already calls the data-table ones. The card says the
  selection is written twice: that half did not reproduce, there is no copy.
- No spec file calls any of the eleven functions: `grep` over `*.spec.ts` is empty. The half of the
  card that holds is «Ни один файл не покрыт спекой».
- `rt-table` has no row selection at all.
- `node tools/specs-for.mjs` binds two of the functions to `table-full-port`: marks held by the
  record key, and the preset of the first rows.

## Questions and answers

The owner took the recommended option twice running at the end of RT-2865 («Внутри кита
(Recommended)», «Логика не видимая (Recommended)»). By the start pattern the questions of this task
are closed by assumption:

- Behaviour changes? No: the functions move, their bodies stay. Taken from the epic plan: «RT-2866
  поведение не меняет».
- An edit of a law or a rule? No.
- One task or several? One.
- Not included: column keys (RT-2867), RT-3015, the look.
- Done when: the selection lives in `table-core` with tests on every function, both families call
  it, the public names stay, the showcase frames do not move.
- Sample: RT-2865 — the same core, the same wrappers keeping the public names.

## Decisions

- **The selection moves into `@rt-tools/ui-kit-v2/table-core`, and the data-table and data-list
  names stay as one-line calls of it.** Applications import them; removing them breaks applications.
- **No frame and no story.** Nothing changes on the screen; by the owner's word on RT-2865 «если
  вид не меняется зачем мне смотреть маке?».

## What is left unclear

- Nothing blocks the work.
