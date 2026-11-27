# RT-3723 — План эпика шторок показывает все пять задач влитыми

Задача RT-3723, запись от 2026-11-27. Прежний адрес: `docs/tasks/RT-3723-epic-sheets-marks/`.

## Согласия владельца по киту

### Approvals

- **Без вида:** «Без изменения вида»

## The owner request

> продолжай

Before it, on the epic: «продолжай работу над основным эпиком». The answer of 26.11 to the question about the epic after PR #3711 was merged: the merged tasks of the epic
are marked by the branch of the next task, and none was taken.

## Questions and answers

**Что делать дальше после слияния #3711?**
продолжай

## Решения разбора

- **Marks and rows by one task of the epic** — the marks are text of the plan, the archive line is one file;
  rejected: a second PR from the merged branch RT-3709 — the push guard refuses a branch whose PR is merged.

## What is left unclear

- Nothing blocks the work.

## Решения по ходу

- **The plan approved** — the owner: «Одобряю план и замену». The reading of goal-critic and product-strategist:
  the rows numbered by digits, the check through `epicPlan` and the check of step 1.2 by the whole record taken in
  the plan; the local branch RT-3706 is not removed before the PR of the epic — exit 13 takes its tip, it has no PR
  and no branch on the server.
- **Review round one** — qa-engineer, goal-critic, product-strategist. Fixed: the section «Как стоят ветки» of the
  epic plan names RT-3706 and RT-3709 and keeps the local branch RT-3706 until the PR of the epic, so the warning
  outlives this folder. Written off: the prettier remark on the archive record of RT-3709 — the same diff stands in
  the base, and step 1.2 requires the record equal to 1fb585865; commit 1fb585865 is not on the server — its content
  is in the branch, and the check was run while it was reachable.
- **The sign of point B replaced** — `node tools/task-flow-script.mjs measure` on `RT-3530-phone-sheets` stops at
  exit 1: the epic branch has no task folder, so exit 12 is never printed there (product-strategist,
  `tools/task-flow/measure/grill.mjs:13`). The sign taken instead: the measure `mergedMarked` called directly over
  the tree of this branch gives `true`, and the measure on `RT-3723-epic-sheets-marks` after its PR shows exit 12.
- **The review of the whole epic, after the PR opened** — the owner: «Ревью эпика всего независимыми агентами»,
  then «Исправляй» and «Все одной задачей» — in this task, not a new one. Four fresh readers over
  `origin/main...origin/RT-3530-phone-sheets`; five findings confirmed by the code are fixed here: a cancelled swipe
  (`RtSheetDrag`, SC-UKV-1921), the focus of `rt-autocomplete` after its sheet (SC-UKV-1620), «×» of the aside sheet
  always — the owner: «в ботомшит асайд кнопка крестик всегда отображается» (SC-UKV-1839), a component without
  `<rt-aside>` at the side on a phone (SC-UKV-1922), the kit changelog. Left as their own tasks: the focus trap of the
  standalone sheet, the tab order for a screen reader, the keyboard lift on a real phone. The card #3728, created by
  mistake for these fixes, is closed as not planned.
- **Review round one of the fixes** — qa-engineer, goal-critic, product-strategist. Fixed: a second tap of the
  autocomplete field reopens its sheet; an `<rt-aside>` drawn late returns the panel to the sheet (`whenAside`);
  an aside without the kit header gets the «×» of the sheet; «×» of a route panel with `closable=false` asks the
  frame like a swipe; «×» keeps a panel held by `disableClose`; the backdrop class of the application is not read
  under the sheet; a second finger does not end a swipe; the changelog names `filtersDiscard`, `phoneCloseLabel`,
  the public additions of the sheet and the change events. The route «×» is confirmed by reading: it takes the road
  of the swipe, which SC-UKV-1820 covers.
- **Цена:** порог веса кита 207053 → 207492 байта: +311 на прерванный свайп, +121 на палец жеста, +7 на правки второго круга.
- **Отменено:** нет

## Цитаты из разбора и хода работы

- The archive record `docs/archive/RT-3709-sheet-code-lazy-weight.md` in the epic branch lacks the line on the
  check of step 3.2 replaced by the owner's «Да, замени и открывай»: it stayed in an unpushed commit of the branch
  RT-3709.

- The task came out of the state «влито» of the epic: the owner answered «продолжай» after PR #3711 was merged.

## Одобрение плана

«Одобряю план и замену»

## Чем подтверждено

- Проверки перед отправкой зелёные целиком; сценарии хуков — за 134 с.
- Шаги плана 1.1–1.3 отмечены движком по их проверкам: 5 влитых строк; запись совпадает с 1fb585865; веток RT-3531 и RT-3709 — 0.
- Ревью: один круг (qa-engineer, goal-critic, product-strategist), серьёзных находок 0, второй круг не нужен по `review-path.mjs --round-two --serious 0`. Исправленные находки — в коммите «правки RT-3723 после первого круга ревью».
- Ревью правок всего эпика: второй круг (qa-engineer, goal-critic, product-strategist). Исправлено в коммите «правки RT-3723 после второго круга ревью»:
  - снятый `<rt-aside>` ставит панель снова сбоку, уходящая панель вид не меняет;
  - «×» шапки кита закрывает и панель под `disableClose`, как стрелка: кнопка выхода подвала в шторке спрятана, и без этого обязательная панель оставалась без выхода. «×» шторки у панели без шапки кита под `disableClose` отказывает: кнопки там в подвале;
  - фокус панели без шапки кита встаёт на «×» шторки;
  - второй палец на ручке не сбрасывает свайп;
  - члены `RtAsideSheet` для службы помечены `@internal`;
  - журнал изменений: части шторки разнесены по RT-3531 и RT-3532, названы типы панели, версия карусели — 0.53.0.
- Не проверено на устройстве: выезжает ли клавиатура Android, когда закрытая шторка `rt-autocomplete` возвращает фокус полю. Отказ «×» шторки под `disableClose` у панели без шапки кита в `closeRequests()` не приходит: тип просьбы знает только `escape` и `backdrop`.

## Оставшийся шаг

Слияние этого PR в `RT-3530-phone-sheets` по вашему слову. Потом PR эпика RT-3530 в main черновиком.
