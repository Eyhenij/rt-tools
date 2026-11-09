# Plan

**Task:** RT-3176 · **Branch:** RT-3176-rules-findings-3
**Behaviour:** unchanged — правки в текстах правил, шаблоне плана и одной строке проверки, без кода приложений; слово владельца «Все пять».

## Points

- **A:** тексты правил не предупреждают о пяти промахах задачи RT-3174.
- **This task reaches:** исполнитель, который читает шаблон плана, `task-flow-cycle`, `agent-kit-source`, `spec-driven-rule` и `epic-flow`, находит там эти пять случаев до того, как наступит на них.
- **Sign:** пять текстов есть в пакете и в установленных файлах, `pnpm -s run agent-kit:check` сходится с пакетом.
- **Milestone G of the epic:** вне эпика.
- **Metric:** нет: починка текстов по разбору закрытой задачи.

## Task footprint

| What     | Where                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| Template | `projects/agent-kit/assets/samples/tasks/_template/plan.md`                                                       |
| Patterns | `projects/agent-kit/assets/patterns/task-flow-cycle.md`, `projects/agent-kit/assets/patterns/spec-driven-rule.md` |
| Rules    | `projects/agent-kit/assets/rules/epic-flow.md`, `.claude/skills/agent-kit-source/SKILL.md`                        |
| Hooks    | `projects/agent-kit/assets/hooks/epic-stop-guard.sh`                                                              |

## What counts as done

- Пять предложений внесены, у `epic-stop-guard.sh` верное правило, проверки текстов и тесты пакета зелёные.

## Stages

### 1. Пять правок

- **Steps:**
    1. Шаблон плана и task-flow-cycle
    2. Две ловушки в agent-kit-source
    3. Указатель состояния в spec-driven-rule
    4. Requires в epic-flow и правило epic-stop-guard
    5. Установка файлов из пакета и проверки
- **Readiness sign:** проверки текстов и тесты пакета зелёные, установка сходится с пакетом.
- **Verified by:** `pnpm -s run agent-kit:check` — строка «разложенное сходится с пакетом».
