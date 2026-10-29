# Plan

**Task:** RT-2990 · **Branch:** RT-2990-kit-figma-approval-gate
**Behaviour:** unchanged — «заведи правила … заведи гейт на это правило»: правило и гард слоя правил, код кита не меняется

## Task footprint

| What  | Where                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------- |
| Laws  | `docs/constitution/mockups.md`                                                                     |
| Rules | `.claude/skills/mockups/`, `.claude/skills/kit-approval/`, `.claude/skills/kit-approval-record/`   |
| Code  | `tools/check-kit-approval.mjs`, `.claude/hooks/kit-approval-guard.sh`, `.claude/rt-kit/project.sh` |

## What counts as done

- Пуш, открытие PR и запуск выпуска кита с видимой правкой отказываются без двух цитат одобрения владельца.
- Совпадение витрины с макетом на 100% измеряется выбранным владельцем инструментом.

## Stages

### 1. Правило и гард одобрений

- **Steps:**
    1. Закон и правило `mockups` включены и заполнены
    2. Правило `kit-approval` и паттерн записи одобрения
    3. Проверка `tools/check-kit-approval.mjs` и её сценарии
    4. Гард на PR и выпуск, строка в наборе пуша
- **Readiness sign:** сценарии проверки проходят, раскладка сходится с пакетом
- **Verified by:** `bash tools/tests/check-kit-approval.test.sh` — «13 ok, 0 failures»

### 2. Проверка совпадения с макетом

- **Steps:**
    1. Инструмент сравнения кадра Figma и кадра витрины по выбору владельца
    2. Число совпадения в записи одобрения и его проверка
- **Readiness sign:** сравнение кадра с самим собой даёт 100%, с изменённым — меньше
- **Verified by:** `bash tools/tests/check-kit-approval.test.sh` — новые сценарии сравнения проходят

## What this work does not do

- RT-2987 через Figma — работа той задачи по новому правилу.
