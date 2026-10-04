# Plan

**Task:** RT-2518 · **Branch:** RT-2518-rules-after-2015
**Behaviour:** unchanged — владелец: «Обе (Recommended)»; правятся только тексты правил

## Task footprint

| What  | Where                                                                |
| ----- | -------------------------------------------------------------------- |
| Specs | нет                                                                  |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/delivery.md` |
| Rules | `.claude/skills/task-flow/`, `.claude/skills/git-workflow-commit/`   |
| Code  | `projects/agent-kit/assets/patterns/`                                |

## What counts as done

- В справке task-flow у статьи о папке задачи названы обе проверки.
- В образце git-workflow-commit есть абзац о задаче закрытого эпика, и он установлен в дерево.

## Stages

### 1. Правки текстов

- **Steps:**
    1. Строка в справке task-flow
    2. Абзац в образце git-workflow-commit
    3. Установить файлы пакета в дерево
- **Readiness sign:** файлы дерева совпадают с пакетом, проверка описаний без расхождений.
- **Verified by:** `pnpm run agent-kit:check` — код выхода 0.

## What this work does not do

- Не меняет текст отказа проверки ветки эпика — это правка кода пакета, отдельная задача при нужде.
