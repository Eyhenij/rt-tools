# Plan

**Task:** RT-3374 · **Branch:** RT-3374-commitlint-scope-ai-chat-protocol
**Behaviour:** unchanged — владелец: «доведи выпуск кита до конца»; правится список областей коммитов и его описание, поведение приложений не меняется

## Points

- **A:** выпуск пакета протокола чата падает на коммите подъёма версии, пакета в npm нет.
- **This task reaches:** запуск публикации проходит шаг коммита и выпускает версию в npm.
- **Sign:** запуск `publish-ai-chat-protocol.yml` с версией `minor` завершается успехом, `npm view @rt-tools/ai-chat-protocol version` называет версию; видит владелец.
- **Milestone G of the epic:** нет эпика: работа по слову владельца вне эпика.
- **Metric:** нет: чинится поломка выпуска, а не правило.

## Task footprint

| What  | Where                                                              |
| ----- | ------------------------------------------------------------------ |
| Specs | нет                                                                |
| Laws  | `docs/constitution/delivery.md`                                    |
| Rules | `.claude/skills/git-workflow/`                                     |
| Code  | `commitlint.config.cjs`, `.claude/skills/git-workflow/implementation.md` |

## What counts as done

- Область `rt:ai-chat-protocol` проходит проверку заголовка коммита.
- Запуск публикации выпускает версию 0.2.0 пакета.

## Stages

### 1. Область коммита

- **Steps:**
    1. Добавить область в `commitlint.config.cjs` и в описание правила поставки.
    2. Проверить заголовок через commitlint.
- **Readiness sign:** заголовок с областью `rt:ai-chat-protocol` принят.
- **Verified by:** `echo 'chore(rt:ai-chat-protocol): версия пакета поднята до 0.2.0 [ci skip]' | pnpm exec commitlint` — вывод без ошибок.

### 2. Выпуск

- **Steps:**
    1. Влить PR задачи в main.
    2. Запустить публикацию с версией minor и дождаться успеха.
- **Readiness sign:** версия пакета видна в реестре.
- **Verified by:** `npm view @rt-tools/ai-chat-protocol version` — выводит `0.2.0`.

## What this work does not do

- Предел ожидания в шаге CI с базой: это задача RT-3373.
