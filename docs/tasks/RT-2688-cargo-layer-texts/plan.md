# Plan

**Task:** RT-2688 · **Branch:** RT-2688-cargo-layer-texts
**Behaviour:** unchanged — правятся правила и образец слоя правил, код приложений не трогается; владелец велел брать записи приёмника

## Task footprint

| What  | Where                                                                                                                                        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules | `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/patterns/`                                                                    |
| Code  | `.claude/skills/lib-layers/`, `.claude/skills/reuse-first/`, `.claude/skills/spec-driven/`, `.claude/skills/spec-driven-domain/` — раскладка |

## What counts as done

- Таблица `lib-layers` называет семейства по настройкам проверок.
- Правило `reuse-first` требует взять образец целиком и записать отход до кода.
- Правило `spec-driven` называет поиск описания по привязкам для файла приложения.
- Образец `spec-driven-domain` выбирает место договорённости по длине описания.
- Записи приёмника отмечены сделанными.

## Stages

### 1. Тексты

- **Steps:**
    1. Строки таблицы lib-layers
    2. Статья reuse-first об образце целиком
    3. Статья spec-driven о поиске описания
    4. Абзац spec-driven-domain о месте договорённости
    5. Раскладка и проверки дерева
- **Readiness sign:** раскладка, описания и размер файлов без расхождений
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»

### 2. Приёмник

- **Steps:**
    1. Отметка записей
- **Readiness sign:** четыре записи в состоянии «исправлено»
- **Verified by:** `npm run -s cargo:close -- --state fixed …` — строки «moved 1»

## What this work does not do

- Команду поиска описания по файлу приложения не пишем: предложение просит назвать её границу.
