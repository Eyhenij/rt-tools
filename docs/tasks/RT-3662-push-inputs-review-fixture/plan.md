# Plan

**Task:** RT-3662 · **Branch:** RT-3662-push-inputs-review-fixture
**Behaviour:** unchanged — меняется сгенерированная таблица входов набора, код и правила не трогаются; владелец велел
довести эпик RT-3603 до главной ветки, а без таблицы набор отправки ветки эпика красный.

## Points

- **A:** набор перед отправкой ветки эпика RT-3603 красный на `node tools/push-inputs.mjs verify`: таблица не знает
  файл образца `projects/agent-kit/tests/fixtures/structure-review/review.diff`, который читает
  `node tools/check-format-ignore.mjs`.
- **This task reaches:** правка файлов `.diff` запускает проверку формата, ветка эпика уходит в главную.
- **Sign:** `node tools/push-inputs.mjs verify` выходит с кодом 0; набор перед отправкой ветки эпика зелёный.
- **Milestone G of the epic:** не двигает: G судит отчёт RT-3656 после выпуска; задача снимает отказ на пути к
  выпуску.
- **Metric:** нет: таблица входов отстала от файла образца RT-3612.

## Decision

No decision: правка не добавляет ни символа, ни файла кода — таблицу пишет готовая команда.

## Task footprint

| Path | What happens |
| --- | --- |
| `.claude/rt-kit/push-inputs.json` | переснята командой `node tools/push-inputs.mjs record` |
| `docs/tasks/RT-3662-push-inputs-review-fixture/` | папка задачи, разбирается последним коммитом |
| `docs/plans/clear-task-statement.md` | строка RT-3662 в составе эпика |

## What counts as done

- `node tools/push-inputs.mjs verify` выходит с кодом 0.
- В таблице есть вход `.diff`.

## Stages

### 1. Таблица входов

- **Steps:**
    1. Переснять таблицу входов командой record
       Check: `node tools/push-inputs.mjs verify` → exit 0
    2. Проверить, что таблица знает расширение файла образца
       Check: `grep -c '"\.diff"' .claude/rt-kit/push-inputs.json` → >= 1
- **Readiness sign:** `verify` зелёный, вход `.diff` записан.
- **Verified by:** `node tools/push-inputs.mjs verify` — код выхода 0.

## What this work does not do

- Не выясняет, почему набор RT-3612 с базой ветки эпика не увидел расхождения: при нужде — своя задача после
  выпуска.
- Не трогает проверку отправки по главной копии: это RT-3658.
