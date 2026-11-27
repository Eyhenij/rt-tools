# RT-3736 — Номер сценария SC-AK-2004 занят дважды после слияния главной ветки

Задача RT-3736 эпика RT-3686, запись от 2026-11-27. Прежний адрес: `docs/tasks/RT-3736-scenario-number-twice/`.

## Шапка разбора

**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/guard/`

## The owner request

> поправь конфликты https://github.com/Eyhenij/rt-tools/pull/3689

The owner's word of 27.11.2026. The PR of the epic RT-3686 into the main branch conflicted with its
base.

## Questions and answers

**Номер сценария SC-AK-2004 занят дважды; страж разрешает правку набора только с папкой задачи и
планом. Как поступить?** (27.11.2026)
«Вести по ходу задачи (Recommended)»

**По правилам нужна новая задача в эпике RT-3686. Заводить?** (27.11.2026)
«Завести задачу в эпике (Recommended)»

## Решения разбора

- **The scenario of the epic branch takes the new number, SC-AK-2021** — the main branch is the
  reviewed base, and its number is already named by its archive record. Rejected: renumbering the
  scenario of the main branch — it would rewrite the texts of a merged work.

## What is left unclear

- None.

## Решения по ходу

- **Первый круг ревью: находок нет** — `qa-engineer` и `goal-critic` прочли разницу ветки с веткой
  эпика: 27 строк в четырёх файлах, проверка спек с кодом 0, набор стража — 160 ok, 0 провалов.
  Affected stage of the plan: нет.
- **Работа шла во второй рабочей копии `rt-pr-3689`** — основная копия занята другой сессией, и
  отправку из временной копии страж не пускает. Affected stage of the plan: нет.

- **Цена:** одна замена номера прошла весь ход задачи: карточка, план, круг ревью, свой PR.
- **Отменено:** нет

## Одобрение плана

«Одобряю»

## Чем подтверждено

- Путь правки лёгкий: `node tools/review-path.mjs` по плану и по разнице ветки. Круг ревью —
  `qa-engineer` и `goal-critic`, находок нет.
- Проверка шага плана: номер SC-AK-2021 стоит в 27 строках четырёх файлов.
- Конфликт PR 3689 с главной веткой снимает коммит слияния в ветке эпика; он уходит на сервер
  вместе с этой задачей.

## Оставшийся шаг

Файл набора `projects/agent-kit/tests/flow-step-guard.test.sh` после слияния главной ветки длиннее предела: случаи ограничителя времени выносятся в свой файл отдельной задачей эпика. После неё — PR эпика RT-3686 в главную ветку.
