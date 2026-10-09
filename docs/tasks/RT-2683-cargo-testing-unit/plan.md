# Plan

**Task:** RT-2683 · **Branch:** RT-2683-cargo-testing-unit
**Behaviour:** unchanged — правится текст правила и образца слоя правил, код приложений не трогается; владелец велел брать записи приёмника

## Task footprint

| What  | Where                                                                     |
| ----- | ------------------------------------------------------------------------- |
| Rules | `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/patterns/` |
| Code  | `.claude/skills/testing/`, `.claude/skills/testing-unit/` — раскладка     |

## What counts as done

- Образец модульных тестов называет файл обвязки для импорта компилятора.
- Статья правила о списке известного называет пометку в строке.
- Записи приёмника отмечены сделанными.

## Stages

### 1. Тексты

- **Steps:**
    1. Пункт об импорте компилятора
    2. Пометка в строке в статье правила
    3. Раскладка и проверки дерева
- **Readiness sign:** раскладка сходится с пакетом
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»

### 2. Приёмник

- **Steps:**
    1. Отметка записей
- **Readiness sign:** две записи в состоянии «исправлено»
- **Verified by:** `npm run -s cargo:close -- --state fixed --proposal <sign> --fix '…'` — строка «moved 1»

## What this work does not do

- Статья в холодную часть правила `testing` не пишется.
