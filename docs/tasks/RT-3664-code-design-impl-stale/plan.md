# Plan

**Task:** RT-3664 · **Branch:** RT-3664-code-design-impl-stale
**Behaviour:** unchanged — правится текст соседнего файла правила, код и проверки не трогаются; владелец велел
довести эпик RT-3603 до главной ветки, а с устаревшим текстом эпик уйдёт в выпуск.

## Points

- **A:** файл `.claude/skills/code-design/implementation.md` в семи строках говорит, что раздел «Решение» и
  сверка кода с ним ничем не проверяются: строки 17, 18, 27, 30 называют это будущими RT-3610 и RT-3611, строки 28,
  29, 31 — «Not checked by anything». Обе задачи влиты, проверки стоят. Пометок «Not checked by anything» — 9.
- **This task reaches:** исполнитель, который читает файл, видит символы проверок «Решения» и то, чего они не
  проверяют, а не номера задач и ложные пометки.
- **Sign:** `grep -q "RT-361[01]"` по файлу — код 1; `grep -c "Not checked by anything"` по файлу — 3 (строки 19,
  21, 25: чтение кода, одна обязанность модуля, одно решение в одном модуле).
- **Milestone G of the epic:** не двигает: G судит отчёт RT-3656 после выпуска.
- **Metric:** нет: файл отстал от влитых задач RT-3610 и RT-3611.

## Decision

No decision: правка не добавляет ни символа, ни файла кода — меняются семь строк текста.

## Task footprint

| Path | What happens |
| --- | --- |
| `.claude/skills/code-design/implementation.md` | строки 17, 18, 27–31 называют `decisionProblems` и `held` |
| `docs/tasks/RT-3664-code-design-impl-stale/` | папка задачи, разбирается последним коммитом |
| `docs/plans/clear-task-statement.md` | строка RT-3664 в составе эпика, отметка «влита» у RT-3662 |

## What counts as done

- В файле нет номеров RT-3610 и RT-3611.
- Пометка «Not checked by anything» стоит только у статей, которые ничто не проверяет: три строки.
- Строка, где проверка держит статью частично, называет символ и то, что остаётся читателю.

## Stages

### 1. Соседний файл правила

- **Steps:**
    1. Переписать строки 17, 18, 27, 30 символами проверок вместо номеров задач
       Check: `grep -q "RT-361[01]" .claude/skills/code-design/implementation.md` → exit 1
    2. Снять ложные пометки «Not checked by anything» в строках 28, 29, 31
       Check: `grep -c "Not checked by anything" .claude/skills/code-design/implementation.md` → = 3
- **Readiness sign:** номеров задач в файле нет, пометок «Not checked by anything» три.
- **Verified by:** `node tools/check-specs.mjs` — код выхода 0: ссылки `путь:символ` файла стоят в коде.

## What this work does not do

- Не добавляет проверку теста без соседей и направления «решение без диска и сети»: файл честно пишет, что их
  ничто не держит.
- Не правит пакетный ресурс правила: этот файл — файл дерева.
