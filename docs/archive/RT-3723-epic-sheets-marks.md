# RT-3723 — План эпика шторок показывает все пять задач влитыми

Задача RT-3723, запись от 2026-11-27. Прежний адрес: `docs/tasks/RT-3723-epic-sheets-marks/`.

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
- **Цена:** нет
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

## Оставшийся шаг

Слияние этого PR в `RT-3530-phone-sheets` по вашему слову. Потом PR эпика RT-3530 в main черновиком.
