# План — RT-2675: аудит называет `Closes` в PR не в main

**Behaviour:** unchanged — правится проверка пакета правил, код приложений не трогается.

## След задачи

| What  | Where                                                     |
| ----- | --------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/board/`                             |
| Code  | `projects/agent-kit/assets/checks/check-board.github.mjs` |
| Tests | `projects/agent-kit/tests/checks-board.test.sh`           |

## What counts as done

- PR с базой не в main и строкой `Closes` получает находку; без строки — не получает; сценарий
  зелёный.

## Stages

### 1. Проверка

- **Steps:**
    1. Тест на PR с базой не в main
    2. Находка в аудите очереди
- **Readiness sign:** набор аудита очереди зелёный
- **Verified by:** `bash projects/agent-kit/tests/checks-board.test.sh` — строка «0 провалов»

### 2. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
