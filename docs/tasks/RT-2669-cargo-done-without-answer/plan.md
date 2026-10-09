# План — RT-2669: вопрос после отказа уходит со строкой о сделанном

**Behaviour:** unchanged — правится проверка пакета правил, код приложений не трогается.

## След задачи

| What  | Where                                           |
| ----- | ----------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/grill/`       |
| Code  | `projects/agent-kit/assets/hooks/grill-gate.sh` |
| Code  | `projects/agent-kit/assets/defaults/project.sh` |
| Tests | `projects/agent-kit/tests/grill-gate.test.sh`   |

## What counts as done

- Вопрос владельцу после отказа проверки уходит только со строкой-меткой и при рабочей команде
  после отказа; сценарий SC-AK-1197 зелёный.

## Stages

### 1. Проверка

- **Steps:**
    1. Тест SC-AK-1197 на вопрос после отказа
    2. Четвёртый признак в проверке вопросов и метка в профиле
- **Readiness sign:** набор проверки вопросов зелёный
- **Verified by:** `bash projects/agent-kit/tests/grill-gate.test.sh` — строка «0 провалов»

### 2. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
