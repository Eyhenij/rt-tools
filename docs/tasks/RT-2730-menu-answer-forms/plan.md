# Plan

**Task:** RT-2730 · **Branch:** RT-2730-menu-answer-forms
**Behaviour:** unchanged — правятся проверки слоя правил, код приложений не трогается; владелец велел брать записи приёмника и эпик RT-2681

## Task footprint

| What  | Where                                                                        |
| ----- | ---------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/epic-stop/`, `docs/specs/agent-kit/turn-guards/grill/` |
| Rules | `.claude/skills/task-flow/`                                                  |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/`              |

## What counts as done

- Проверка конца эпика пропускает вызов по ответу меню в обоих видах и не пропускает, когда
  номер стоит только в вопросе.
- Проверка разбора считает ответы меню в обоих видах.
- Сценарии лежат в спеках и покрыты наборами; раскладка совпадает с пакетом.

## Stages

### 1. Проверки

- **Steps:**
    1. Тесты на оба вида ответа и на номер в вопросе
    2. Правка проверки конца эпика
    3. Правка проверки разбора
- **Readiness sign:** наборы обеих проверок зелёные
- **Verified by:** `bash projects/agent-kit/tests/epic-stop-guard.test.sh` — строка итога без провалов

### 2. Спеки и раскладка

- **Steps:**
    1. Сценарии в спеках
    2. Раскладка и проверки дерева
- **Readiness sign:** спеки и раскладка без расхождений
- **Verified by:** `npm run check:specs` — ноль расхождений

## What this work does not do

- Другие проверки, читающие результаты инструментов, не трогаются: ответ меню они не читают.
