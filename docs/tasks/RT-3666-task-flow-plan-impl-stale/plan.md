# Plan

**Task:** RT-3666 · **Branch:** RT-3666-task-flow-plan-impl-stale
**Behaviour:** unchanged — правится текст соседнего файла правила, код и проверки не трогаются; владелец велел
довести эпик RT-3603 до главной ветки, а с устаревшим текстом эпик уйдёт в выпуск.

## Points

- **A:** строка 22 `.claude/skills/task-flow-plan/implementation.md` говорит, что сверку кода с «Решением» ничто не
  проверяет; её делает `tools/task-flow/measure/design.mjs:held` в конце этапов.
- **This task reaches:** исполнитель, который читает файл, знает, что расхождение кода с «Решением» ловит конец
  этапов.
- **Sign:** `grep -rq "by anything yet" .claude/skills` — код 1; строка называет `design.mjs:held`.
- **Milestone G of the epic:** не двигает: G судит отчёт RT-3656 после выпуска.
- **Metric:** нет: файл отстал от влитой задачи RT-3611.

## Decision

No decision: правка не добавляет ни символа, ни файла кода — меняется конец одной строки текста.

## Task footprint

| What (правится) | Where |
| --- | --- |
| Строка 22 соседнего файла правила | `.claude/skills/task-flow-plan/implementation.md` |
| Состав эпика: RT-3664 влита, строка RT-3666 | `docs/plans/clear-task-statement.md` |

## What counts as done

- Во всех файлах правил дерева нет «by anything yet».
- Строка 22 называет `tools/task-flow/measure/design.mjs:held`.

## Stages

### 1. Строка файла правила

- **Steps:**
    1. Убрать из строки 22 слова о том, что сверку ничто не проверяет
       Check: `grep -rq "by anything yet" .claude/skills` → exit 1
    2. Назвать в строке 22 проверку конца этапов
       Check: `grep -q "design.mjs:held" .claude/skills/task-flow-plan/implementation.md` → exit 0
- **Readiness sign:** строка 22 называет `held`, слов «by anything yet» в правилах нет.
- **Verified by:** `node tools/check-specs.mjs` — код выхода 0: ссылка `путь:символ` стоит в коде.

## What this work does not do

- Не правит пакетный ресурс правила: этот файл — файл дерева.
