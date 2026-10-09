# План — RT-2680: проверка перед push — предел времени, несколько push, повтор номера, красный прогон

**Behaviour:** unchanged — правятся проверки, раскладка и правила пакета, код приложений не трогается.

## След задачи

| What  | Where                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/src/lib/hooks-map.ts`, `projects/agent-kit/assets/checks/` |
| Rules | `projects/agent-kit/assets/rules/`                                                                                 |
| Tests | `projects/agent-kit/tests/`, `projects/agent-kit/src/lib/hooks-map.spec.ts`                                        |

## What counts as done

- Команда с несколькими push отбита; новая запись диспетчера несёт предел времени; повтор номера
  в таблице эпика назван; правило отчёта ставит красный прогон первой строкой; наборы зелёные.

## Stages

### 1. Несколько push

- **Steps:**
    1. Тест и отказ команде с несколькими push
- **Readiness sign:** набор проверки перед push зелёный
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — строка «0 провалов»

### 2. Предел времени

- **Steps:**
    1. Тест и предел времени в записи диспетчера
- **Readiness sign:** модульные тесты пакета зелёные
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — строка «Tests:» без провалов

### 3. Таблица эпика и отчёт

- **Steps:**
    1. Тест и находка о повторе номера в таблице эпика
    2. Статья о красном прогоне в отчёте о состоянии
- **Readiness sign:** набор проверки плана эпика зелёный
- **Verified by:** `bash projects/agent-kit/tests/checks-board-epic-plan.test.sh` — строка «0 провалов»

### 4. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
