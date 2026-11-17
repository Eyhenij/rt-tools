# Plan

**Task:** RT-3368 · **Branch:** RT-3368-ai-chat-protocol
**Spec:** `docs/specs/ai-chat-protocol/`
**Behaviour:** changes

## Points

- **A:** Вид `rt-ai-chat` есть в ките, а редьюсер запуска и классификация ошибок записаны в каждом из двух приложений отдельно.
- **This task reaches:** отдельный пакет `@rt-tools/ai-chat-protocol` без Angular, из которого оба приложения берут события, редьюсер, порты и классы ошибок.
- **Sign:** `pnpm exec nx test @rt-tools/ai-chat-protocol` зелёный на записанных потоках, сверенных с редьюсером второго приложения; смотрит владелец в отчёте проверки.
- **Milestone G of the epic:** нет эпика: первая из шести задач общего слоя чата, дальше транспорт, браузерные инструменты и контроллер запуска.
- **Metric:** нет: это новый пакет, а не улучшение правила или проверки.

## Task footprint

| What  | Where                                                                                   |
| ----- | --------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ai-chat-protocol/`                                                          |
| Laws  | `docs/constitution/code-structure.md`, `docs/constitution/verifiability.md`             |
| Rules | `.claude/skills/typescript-conventions/`, `.claude/skills/testing/`                     |
| Code  | `projects/ai-chat-protocol/`, `tsconfig.base.json`, `package.json`, `eslint.config.mjs` |

## What counts as done

- Пакет собирается двумя компиляторами и тесты проходят с покрытием 100%.
- Записанные потоки (ответ, серверный инструмент, браузерный инструмент, ошибка, обрыв) дают то же состояние, что редьюсер второго приложения.
- В пакете нет импортов Angular, RxJS, NestJS и названий приложений.
- Вид `rt-ai-chat` и публичный API кита не тронуты.

## Stages

### 1. Каркас пакета

- **Steps:**
    1. Сложить `package.json`, `README.md`, tsconfig и jest по образцу пакета без фреймворка.
    2. Прописать пакет в `tsconfig.base.json`, `package.json` и правиле линтера.
- **Readiness sign:** пакет известен nx и собирается пустым.
- **Verified by:** `pnpm exec nx show project @rt-tools/ai-chat-protocol --json` — в ответе есть цель `build`.

### 2. Типы, ошибки и редьюсер

- **Steps:**
    1. Описать перечисления, модели и события.
    2. Написать классификацию ошибок и редьюсер запуска.
    3. Написать читатель события и порты.
- **Readiness sign:** типы и функции экспортированы из точки входа.
- **Verified by:** `pnpm exec nx build @rt-tools/ai-chat-protocol` — сборка esm и cjs без ошибок.

### 3. Эталоны и тесты

- **Steps:**
    1. Снять с редьюсера второго приложения состояния записанных потоков.
    2. Положить потоки и состояния в тесты пакета и сверить.
    3. Покрыть остальные ветки до 100%.
- **Readiness sign:** все сценарии `SC-ACP-1`…`SC-ACP-10` зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ai-chat-protocol` — все наборы зелёные, порог покрытия не нарушен.

### 4. Проверки дерева

- **Steps:**
    1. Прогнать линтер и типы пакета.
    2. Прогнать проверку спеков.
- **Readiness sign:** линтер и проверка спеков без замечаний.
- **Verified by:** `pnpm exec nx lint @rt-tools/ai-chat-protocol` — без ошибок.

## What this work does not do

- Вид панели, транспорт, браузерные инструменты и контроллер запуска: следующие задачи общего слоя.
- Выпуск пакета, пуш и PR: только после слова владельца.
