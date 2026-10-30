# Grill

## The owner request

> #2860 Таблицы

> не забудь затащить в работу и заасайнить меня, чтобы другой разработчик не взял повторно

RT-2867 is the fourth task of the epic by `docs/plans/ui-kit-v2-table-core.md`. The card is in
progress, the owner is an assignee; the branch stands on `RT-2866-table-selection-core`.

## What the tree already has

- `projects/ui-kit-v2/src/lib/components/table/rt-table-settings.persistence.ts` — `rt-table`
  keeps its column settings in IndexedDB under `ERtStorageKeys.TableColumnsPrefix` + the table id.
  The value is the column settings only.
- `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts` — `rt-data-table`
  keeps the whole table config (columns, their order, visibility, two scrollbar signs) under the
  string the application passes, as the first kit did.
- The two stores differ in the key and in the shape of the value. Shared code between them is the
  read and the write by a key — a few lines.
- Question 4 of the epic card was deferred to this task: move `rt-data-table` to the registry keys
  with a one-time move of the old values, or not.

## Questions and answers

The streak rule would close question 4 by assumption: keep each table as it is, as the owner chose
for the sort and the filter. That assumption leaves the task with nothing to do — the key forms stay
different, which is the whole complaint of the card. So the question goes to the owner, said so
first.

Asked on 30.10 with the options «Ключи реестра с переносом (Recommended)» and «Оставить, закрыть
RT-2867». Answer: «ничего не понял?». The question is asked again in the words of the screen.

Asked again on 30.10: whether the saved columns of `rt-data-table` move under a kit key, with the
old values carried over. Answer: «если пользователи приложений не потеряют свои конфиги то можно
делать».

## Decisions

- **Not included:** the look of the tables, RT-3015.
- **The key moves under a prefix of its own, `rt.data-table.config.`.** The value of
  `rt-data-table` has another shape than that of `rt-table`; one prefix would let one id read a
  foreign value.
- **The old record is copied, not moved.** The owner's condition is that nobody loses settings, and
  a first-kit table in the same application may still read the old record.
- **A reset removes both records.** Otherwise the old record is copied back on the next opening.
- **Nothing changes on the screen, so no mockup is drawn** — the same ground as the owner's word on
  RT-2865: «если вид не меняется зачем мне смотреть маке?».

## What is left unclear

Nothing.
