# Plan

**Task:** RT-3376 · **Branch:** RT-3376-ai-chat-protocol-js-imports
**Behaviour:** unchanged — владелец велел выпустить кит; меняется только запись путей импорта в исходниках пакета, поведение функций то же

## Points

- **A:** пакет `0.2.0` в npm не загружается в Node.
- **This task reaches:** собранный пакет загружается в чистом Node как ESM и как CommonJS.
- **Sign:** загрузка `dist/ai-chat-protocol/esm/index.js` и `cjs/index.js` в Node печатает список экспортов.
- **Milestone G of the epic:** вне эпика, по слову владельца.
- **Metric:** нет: сломан импорт в собранном пакете.

## Task footprint

| What | Where                                    |
| ---- | ---------------------------------------- |
| Code | `projects/ai-chat-protocol/src/lib/*.ts` |

## What counts as done

- Каждый относительный импорт в `projects/ai-chat-protocol/src` оканчивается на `.js`.
- Собранные `esm` и `cjs` загружаются в чистом Node.
- Тесты пакета зелёные.

## Stages

### 1. Импорты с расширением

- **Steps:**
    1. Добавить `.js` во все относительные импорты исходников
    2. Собрать пакет и загрузить его в Node
- **Readiness sign:** оба вида сборки загружаются в чистом Node.
- **Verified by:** `pnpm run build:ai-chat-protocol` — сборка кончается без ошибок

## What this work does not do

- Общая проверка собранного пакета, правило выпуска и хук запуска публикации: отдельная задача.
