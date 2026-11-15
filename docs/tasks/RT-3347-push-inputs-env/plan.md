# Plan

**Task:** RT-3347 · **Branch:** RT-3347-push-inputs-env
**Behaviour:** unchanged — правка проверки набора перед пушем, кода приложений нет; слово владельца «Сначала починить проверку»

## Points

- **A:** `push-inputs verify` отказывает в копии, окружение которой отличается от копии записи.
- **This task reaches:** пуш из копии с `.env` и из копии без него проходит при одной таблице.
- **Sign:** `node tools/push-inputs.mjs verify` в этой копии (с `.env`) печатает «the table covers».
- **Milestone G of the epic:** вне эпика; открывает пуш ветки эпика RT-3346.
- **Metric:** нет: проверка ломалась от окружения машины.

## Task footprint

| What  | Where                                              |
| ----- | -------------------------------------------------- |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`            |
| Rules | `.claude/skills/agent-kit-source/`                 |
| Code  | `projects/agent-kit/assets/checks/push-inputs.mjs` |

## What counts as done

- Чтение, проба и обход файла вне истории не попадают ни в таблицу, ни в отказ `verify`.
- `record` сохраняет виды процессов, которые таблица уже держала для шага.
- Сценарии SC-AK-1356 и SC-AK-1357 описаны в спеке и проходят.
- Таблица переписана, `verify` зелёный в этой копии.

## Stages

### 1. Правка проверки

- **Steps:**
    1. Отбросить пути вне истории в записи шага
    2. Сохранять в записи виды процессов из прежней таблицы
    3. Добавить сценарии SC-AK-1356 и SC-AK-1357 в спек и в тест
- **Readiness sign:** сценарии проверки входов зелёные.
- **Verified by:** `bash projects/agent-kit/tests/push-inputs.test.sh` — код выхода `0`

### 2. Раскладка и таблица

- **Steps:**
    1. Собрать пакет и разложить
    2. Переписать таблицу входов и сверить её
- **Readiness sign:** `verify` зелёный в копии с `.env`.
- **Verified by:** `node tools/push-inputs.mjs verify` — `the table covers`

## What this work does not do

- Не меняет набор шагов перед пушем и сами шаги `check-format-ignore` и `check-schema-drift`.
