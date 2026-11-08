# Plan

**Task:** RT-3169 · **Branch:** RT-3169-rules-findings
**Behaviour:** unchanged — правки только в текстах правил, ролях, переопределениях и карте проверки правил; слово владельца «делай все пункты которые ты нашёл».

## Points

- **A:** тексты правил расходятся с ходом работы, найденным разбором эпика RT-3151: роли удаляют во временной папке, шаги вехи после слияния эпика без хозяина, подпись через `export` роняет набор, выкатку пытается жать исполнитель.
- **This task reaches:** исполнитель читает в правилах, кто жмёт выкатку, как подписать коммит, что делать с шагами вехи и где взять отчёт; роли больше не зависают на удалении.
- **Sign:** `pnpm -s run agent-kit:check` сходится, `node tools/check-file-size.mjs` без превышений, карта проверки правил отвечает `permissions` на файле прав.
- **Milestone G of the epic:** вне эпика.
- **Metric:** минут впустую, вниз. База не снята: первый отчёт по деревьям после выпуска пакета.

## Task footprint

| What      | Where                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules     | `projects/agent-kit/assets/rules/task-flow.md`, `.claude/skills/task-flow/implementation.md`, `.claude/skills/permissions/implementation.md` |
| Patterns  | `projects/agent-kit/assets/patterns/task-flow-close.md`, `projects/agent-kit/assets/patterns/git-workflow-commit.*.md`                       |
| Roles     | `projects/agent-kit/assets/agents/product-strategist.md`, `projects/agent-kit/assets/agents/goal-critic.md`                                  |
| Overrides | `.claude/rt-kit/overrides/rules/deploy-flow.github.md`, `.claude/rt-kit/overrides/patterns/task-flow-cycle.md`, `.claude/rt-kit/gate-map.sh` |

## What counts as done

- Все семь правок лежат в правилах и разложены, проверки веса, ссылок и установки файлов из пакета зелёные.

## Stages

### 1. Семь правок

- **Steps:**
    1. Правки пакета: правило, паттерны, роли
    2. Правки дерева: переопределения, соседний файл, карта проверки правил
    3. Установка файлов из пакета и проверки
- **Readiness sign:** установка файлов из пакета сходится с пакетом, превышений веса нет.
- **Verified by:** `pnpm -s run agent-kit:check` — строка «разложенное сходится с пакетом».
