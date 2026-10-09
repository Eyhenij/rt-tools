# План — RT-2671: проверка конца хода и названная причина

**Behaviour:** unchanged — правятся проверки пакета правил, код приложений не трогается.

## След задачи

| What  | Where                                                  |
| ----- | ------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/turn-guards/`                    |
| Code  | `projects/agent-kit/assets/hooks/turn-exit-verdict.sh` |
| Code  | `projects/agent-kit/assets/hooks/turn-exit-guard.sh`   |
| Code  | `projects/agent-kit/assets/hooks/proposal-guard.sh`    |
| Tests | `projects/agent-kit/tests/turn-exit-guard.test.sh`     |
| Tests | `projects/agent-kit/tests/proposal-guard.test.sh`      |

## What counts as done

- Давнее слово владельца об остановке с цитатой отпускает ход, названная причина отпускает
  неотправленные коммиты, отчёт роли не будит проверку предложений; сценарии SC-AK-1199 и
  SC-AK-1200 зелёные.

## Stages

### 1. Проверки

- **Steps:**
    1. Тесты SC-AK-1199 и SC-AK-1200
    2. Слово об остановке за сессию и названная причина в проверке конца хода
    3. Служебные сообщения в проверке предложений
- **Readiness sign:** наборы обеих проверок зелёные
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — строка «0 провалов»

### 2. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
