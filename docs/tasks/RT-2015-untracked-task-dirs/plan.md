# Plan

**Task:** RT-2015 · **Branch:** RT-2015-untracked-task-dirs
**Spec:** `docs/specs/agent-kit/work/queue-check/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                |
| ----- | -------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/work/queue-check/`                             |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/work-conduct.md` |
| Rules | `.claude/skills/task-flow/`                                          |
| Code  | `projects/agent-kit/assets/checks/`, `projects/agent-kit/tests/`     |

## What counts as done

- Проверка очереди работ называет папку с номером задачи, в которой нет ни одного файла из индекса.
- Черновик `_draft-<slug>` и образец `_template` эта проверка не называет.
- В строке отказа сказано, что делать: завести ветку и закоммитить папку или удалить её.

## Stages

### 1. Проверка и сценарий

- **Steps:**
    1. Правило и сценарий в описании queue-check
    2. Отбор папок вне индекса в board-task-dirs
    3. Строка отказа в check-board
    4. Сценарий в checks-board-folders.test.sh
- **Readiness sign:** тест пакета зелёный, новый сценарий в нём есть.
- **Verified by:** `bash projects/agent-kit/tests/checks-board-folders.test.sh` — новые строки сценария с «ok», ни одного «FAIL».

### 2. Установка файлов из пакета

- **Steps:**
    1. Установить файлы пакета в дерево
    2. Прогнать проверки перед push
- **Readiness sign:** файлы дерева совпадают с пакетом.
- **Verified by:** `pnpm run agent-kit:check` — код выхода 0.

## What this work does not do

- Не меняет `task:new` — по слову владельца.
- Не трогает папки в соседней рабочей копии: их увидит её сессия.
