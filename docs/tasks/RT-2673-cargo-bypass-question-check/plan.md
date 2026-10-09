# План — RT-2673: вопрос с вариантом обхода проверки не уходит

**Behaviour:** unchanged — правится проверка пакета правил, код приложений не трогается.

## След задачи

| What  | Where                                           |
| ----- | ----------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/grill/`       |
| Code  | `projects/agent-kit/assets/hooks/grill-gate.sh` |
| Tests | `projects/agent-kit/tests/grill-gate.test.sh`   |
| Rules | `.claude/skills/turn-conduct/implementation.md` |

## What counts as done

- Меню и вопрос прозой с вариантом обхода проверки отбиваются; сценарий SC-AK-1202 зелёный.

## Stages

### 1. Проверка

- **Steps:**
    1. Тест SC-AK-1202 на вопрос с вариантом обхода
    2. Пятый признак в проверке вопросов
- **Readiness sign:** набор проверки вопросов зелёный
- **Verified by:** `bash projects/agent-kit/tests/grill-gate.test.sh` — строка «0 провалов»

### 2. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
