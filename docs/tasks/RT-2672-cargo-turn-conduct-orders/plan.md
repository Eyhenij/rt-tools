# План — RT-2672: поручения в правиле хода и слово владельца в проверке конца эпика

**Behaviour:** unchanged — правятся проверка и тексты пакета правил, код приложений не трогается.

## След задачи

| What  | Where                                                |
| ----- | ---------------------------------------------------- |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`    |
| Rules | `projects/agent-kit/assets/pitfalls/turn-conduct.md` |
| Rules | `.claude/skills/turn-conduct/implementation.md`      |
| Code  | `projects/agent-kit/assets/hooks/epic-stop-guard.sh` |
| Tests | `projects/agent-kit/tests/epic-stop-guard.test.sh`   |
| Specs | `docs/specs/agent-kit/`                              |

## What counts as done

- Слово владельца с номером новой работы снимает отказ проверки конца эпика, сценарий SC-AK-1201
  зелёный; пять статей стоят в `turn-conduct` с привязками, правило в пределах длины.

## Stages

### 1. Проверка конца эпика

- **Steps:**
    1. Тест SC-AK-1201 на слово владельца с номером работы
    2. Проверка читает слово владельца из записи хода
- **Readiness sign:** набор проверки конца эпика зелёный
- **Verified by:** `bash projects/agent-kit/tests/epic-stop-guard.test.sh` — строка «0 провалов»

### 2. Статьи правила

- **Steps:**
    1. Доводы соседних статей перенесены в холодную часть
    2. Пять статей и их привязки
- **Readiness sign:** правило в пределах длины, привязки сходятся
- **Verified by:** `node tools/check-file-size.mjs` — строка «no new ones»

### 3. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
