# План — RT-2668: проверка вопросов не считает правками файлы вне дерева

**Behaviour:** unchanged — правится проверка пакета правил, код приложений не трогается.

## След задачи

| What  | Where                                           |
| ----- | ----------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/grill/`       |
| Code  | `projects/agent-kit/assets/hooks/grill-gate.sh` |
| Tests | `projects/agent-kit/tests/grill-gate.test.sh`   |

## What counts as done

- Правка черновика вне дерева не задаёт область работы, и сценарий SC-AK-1196 зелёный.

## Stages

### 1. Проверка

- **Steps:**
    1. Тест SC-AK-1196 на правку вне дерева
    2. Цикл области пропускает пути вне корня дерева
- **Readiness sign:** набор проверки вопросов зелёный
- **Verified by:** `bash projects/agent-kit/tests/grill-gate.test.sh` — строка «0 провалов»

### 2. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
