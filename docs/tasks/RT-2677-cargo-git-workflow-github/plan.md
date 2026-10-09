# План — RT-2677: база PR из стопки, аудит очереди в своём правиле

**Behaviour:** unchanged — правятся проверки и правила пакета, код приложений не трогается.

## След задачи

| What  | Where                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-epic/`, `docs/specs/agent-kit/board/`                                                    |
| Rules | `projects/agent-kit/assets/rules/git-workflow.github.md`                                                                |
| Code  | `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh`, `projects/agent-kit/assets/checks/board-epics.github.mjs` |
| Tests | `projects/agent-kit/tests/guard-epic-base.test.sh`, `projects/agent-kit/tests/checks-board.test.sh`                     |

## What counts as done

- PR задачи эпика с базой из предыдущей ветки той же стопки проходит хук и аудит; база main
  по-прежнему отбита; сценарий зелёный.
- Статьи об аудите очереди лежат в правиле `queue-audit`, карта правил называет его для файлов
  аудита, проверки спеков и длины зелёные.

## Stages

### 1. База стопки

- **Steps:**
    1. Тесты на базу из стопки в хуке и аудите
    2. Хук и аудит принимают базу из стопки
    3. Статья, привязки и сценарий
- **Readiness sign:** наборы хука базы эпика и аудита очереди зелёные
- **Verified by:** `bash projects/agent-kit/tests/guard-epic-base.test.sh` — строка «0 провалов»

### 2. Правило аудита очереди

- **Steps:**
    1. Правило `queue-audit` из статей об аудите
    2. Спутник, образец и карта правил
- **Readiness sign:** проверка спеков зелёная
- **Verified by:** `npm run check:specs` — код выхода 0

### 3. Сдача

- **Steps:**
    1. Сборка пакета, раскладка, проверки перед push
    2. Папка задачи разобрана, PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика
- **Verified by:** `pnpm run agent-kit:check` — строка «разложенное сходится с пакетом»
