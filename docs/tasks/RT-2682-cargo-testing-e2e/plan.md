# Plan

**Task:** RT-2682 · **Branch:** RT-2682-cargo-testing-e2e
**Behaviour:** unchanged — правится текст образца слоя правил, код приложений не трогается; владелец велел брать записи приёмника

## Task footprint

| What  | Where                                     |
| ----- | ----------------------------------------- |
| Rules | `projects/agent-kit/assets/patterns/`     |
| Code  | `.claude/skills/testing-e2e/` — раскладка |

## What counts as done

- Описание образца не перечисляет наборы по именам.
- Раздел об ожидании опросом называет готовность по данным.
- «Common misses» называет имя сервиса из контракта.
- Записи приёмника отмечены сделанными.

## Stages

### 1. Образец

- **Steps:**
    1. Описание образца
    2. Абзац о готовности по данным
    3. Пункт об имени сервиса
    4. Раскладка и проверки дерева
- **Readiness sign:** раскладка сходится с пакетом
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»

### 2. Приёмник

- **Steps:**
    1. Отметка записей
- **Readiness sign:** три записи в состоянии «исправлено»
- **Verified by:** `npm run -s cargo:pull -- --kind proposal --state fixed --size 100 --text` — три ключа в выводе

## What this work does not do

- Предложение о пометках в строке для правила `testing` — задача RT-2683.
