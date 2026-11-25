# Разбор

Работа начата не из приёмника: ключей записей нет.

## The owner request

Задача вышла из шага, который владелец велел сделать: довести эпик RT-3603 до главной ветки и выпуска кита. Ответ
владельца в меню 25.11 о последней задаче эпика:

> Отложить RT-3656

Вариант, который он выбрал, звучал так: «Эпик идёт в main и в выпуск без неё». Роли `goal-critic` и
`product-strategist` при ревью RT-3664 нашли тот же устаревший факт в другом файле правила; эпик не должен уйти в
главную с ним.

## What the tree already has

- Строка 22 `.claude/skills/task-flow-plan/implementation.md`: «whether the code matches them is not checked by
  anything yet». Строка пришла с RT-3610, до влития RT-3611.
- С RT-3611 код с «Решением» в конце этапов сверяет `tools/task-flow/measure/design.mjs:held`; выход состояния
  `этапы-кончились` — `all: [measure.footprint.touched, measure.design.held]` в `tools/task-flow/flow.js`.
- Поиск по `.claude/skills`, `docs/specs`, `docs/constitution` и ресурсам пакета на «by anything yet» и на номера задач
  эпика как будущих проверок нашёл только эту строку.

## What the rules already say

- `doc-style`: проверка называется запуском, а не пересказом; соседний файл правила говорит правду о дереве.
- `git-workflow`: правка идёт веткой задачи, не в ветку эпика.

## Questions and answers

Вопросов владельцу нет: строку нашли роли, замену называет код.

## Decisions

- **Меняется конец одной строки** — остальное в строке проверено ролями RT-3664 и верно. Отброшено: переписать
  статью целиком.

## What is left unclear

- Нет.
