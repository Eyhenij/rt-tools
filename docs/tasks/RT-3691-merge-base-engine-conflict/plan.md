# Plan

**Task:** RT-3691 · **Branch:** RT-3691-merge-base-engine-conflict
**Behaviour:** unchanged — правится проверка хода работы пакета правил, код приложений не трогается; слово владельца: «Задача вне эпика от main»

## Points

- **A:** 26.11 слияние `main` в ветку эпика RT-3602 дало 8 конфликтов. Проверка хода работы отказала и правку
  конфликта в `projects/agent-kit/assets/checks/task-flow-script.mjs`, и `git checkout --theirs`. Слияние отменено,
  задача эпика RT-3674 не взята.
- **This task reaches:** пока идёт слияние проверенной базы — удалённой главной ветки или ветки эпика из плана
  эпика, — проходят два хода в файле с конфликтом: правка, которая заменяет блок с маркерами одной стороной или
  обеими подряд, и `git checkout`/`git restore` с `--ours` или `--theirs`. Строка, которой нет ни в одной стороне,
  правка вне блока с маркерами и ручное разрешение конфликта при слиянии непроверенной ветки отказаны, как сейчас.
- **Sign:** проба во временном клоне `bash /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/611348a0-4037-4ebe-8492-719501de2c3b/scratchpad/rt-merge/probe.sh`
  зовёт сам хук `flow-step-guard.sh` с папкой проекта этой копии; «pass» правки засчитан, только когда и сам
  движок ответил кодом 0, иначе «crash». Случай `outside` удаляет строку источника вне его блока. Сейчас она даёт
  `edit=deny checkout=deny newline=deny outside=deny unreviewed=deny`, после правки — `edit=pass checkout=pass newline=deny outside=deny unreviewed=deny`.
  Случаи SC-AK-2016 в `projects/agent-kit/tests/flow-step-guard.test.sh` проводят настоящий `git merge` во
  временном репозитории.
- **Milestone G of the epic:** нет: задача вне эпика по слову владельца. Ход судит движок из `tools/` папки проекта
  сессии. У этой сессии это главная копия на `00422d2cf`, а не эта копия. Слияние `main` в ветку эпика RT-3602
  пройдёт, когда правка будет в движке, который судит сессию.
- **Metric:** нет: ветка эпика RT-3602 отстаёт от `main` на 133 коммита, и это число задача не меняет.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/agent-kit/assets/checks/flow-merge.mjs` — новый модуль: `resolvesBlock(call, merge)` — в каждой правке Edit или MultiEdit `old_string` равна одному блоку `<<<<<<<`…`>>>>>>>` целиком, без строк вокруг, а `new_string` — его сторона `ours`, сторона `theirs` или обе подряд; `choosesSide(paths, merge)` — каждый путь не слит. `projects/agent-kit/assets/checks/flow-guard-run.mjs:reviewedMerge` — идёт ли слияние, чья голова лежит в удалённой главной ветке или в удалённой ветке эпика из плана эпика, и какие пути не слиты; `guardContext` отдаёт `merge` — этот ответ или `null`. `projects/agent-kit/assets/checks/flow-guard.mjs`: `judgeCall` пропускает правку охраняемого файла, которую принял `resolvesBlock`; `judgeShell` считает `git checkout`/`git restore` с `--ours`/`--theirs` чтением, когда `choosesSide` принял пути |
| Dependencies | `flow-guard.mjs` импортирует `flow-merge.mjs`; `flow-merge.mjs` ничего не импортирует; git зовёт только `flow-guard-run.mjs` |
| Coupling | `projects/agent-kit/assets/checks/flow-guard.mjs` исходящие 1 → 2; `projects/agent-kit/assets/checks/flow-guard-run.mjs` исходящие 1 → 1; `projects/agent-kit/assets/checks/flow-merge.mjs` исходящие 0 |
| Patterns | паттерна нет: две чистые функции над текстом блока и списком путей, одна функция чтения git рядом с `committed` в `guardContext` |
| Terms | «проверенная база» — голова слияния лежит в удалённой главной ветке или в удалённой ветке эпика; «блок конфликта» — строки от `<<<<<<<` до `>>>>>>>`; слова вводятся в спеке проверки, в глоссарий не идут |
| Input | `MERGE_HEAD`; `git ls-files -u`; Edit, MultiEdit, Write охраняемого файла; `git checkout --ours|--theirs`, `git restore --ours|--theirs`; блок с секцией `|||||||`; голова, не лежащая ни в главной, ни в ветке эпика; строка ни одной стороны; правка вне блока; удаление строки вне блока в файле с конфликтом; блок вместе с соседней строкой в `old_string`; слитый путь в `git checkout --ours`; правка без слияния. SC-AK-2016, `projects/agent-kit/tests/flow-step-guard.test.sh` |
| Bounds | без идущего слияния проверка судит как сейчас; Write охраняемого файла судится прежним правилом и при слиянии; одобрение плана, отметки шагов, ход работы и переопределение описания не меняются; `flow-guard.mjs` не длиннее 500 строк |
| Priority | отказ сильнее: что не доказано как выбор стороны в блоке конфликта, судится прежним правилом охраны |
| Budget | `projects/agent-kit/assets/checks/flow-guard.mjs` до 499; `projects/agent-kit/assets/checks/flow-guard-run.mjs` плюс 25; `projects/agent-kit/assets/checks/flow-merge.mjs` до 60; `projects/agent-kit/tests/flow-step-guard.test.sh` плюс 70; новых файлов кода: 1; новых зависимостей: 0 |

## Task footprint

| What              | Where                         |
| ----------------- | ----------------------------- |
| Specs (правится)  | `docs/specs/agent-kit/turn-guards/flow-script/guard/` |
| Laws              | `docs/constitution/work-conduct.md` |
| Rules             | `.claude/skills/task-flow-plan/`, `.claude/skills/git-workflow/` |
| Code (правится)   | `projects/agent-kit/assets/checks/flow-merge.mjs`, `projects/agent-kit/assets/checks/flow-guard.mjs`, `projects/agent-kit/assets/checks/flow-guard-run.mjs`, `projects/agent-kit/tests/flow-step-guard.test.sh` |
| Layout (правится) | `tools/flow-merge.mjs`, `tools/flow-guard.mjs`, `tools/flow-guard-run.mjs` |

## What counts as done

- Проба через хук во временном клоне: при слиянии `main` в ветку эпика RT-3602 блок источника под сторону `main` и
  `git checkout --ours` разложенной копии проходят; строка ни одной стороны, правка вне блока и слияние
  непроверенной ветки отказаны.
- Случаи SC-AK-2016 зелёные, прежние случаи проверки хода работы зелёные; правка `flow-merge.mjs` вне плана отказана.

## Stages

### 1. Проверка и случаи

- **Steps:**
    1. Блок конфликта в модуле слияния
       Check: `grep -c 'export function resolvesBlock\|export function choosesSide' projects/agent-kit/assets/checks/flow-merge.mjs` → >= 2
    2. Слияние проверенной базы в контексте проверки
       Check: `grep -c 'reviewedMerge' projects/agent-kit/assets/checks/flow-guard-run.mjs` → >= 2
    3. Выбор стороны в модуле слияния и в суждении проверки
       Check: `grep -c 'resolvesBlock\|choosesSide' projects/agent-kit/assets/checks/flow-guard.mjs` → >= 3
    4. Случаи SC-AK-2016 в наборе проверки
       Check: `grep -c 'SC-AK-2016' projects/agent-kit/tests/flow-step-guard.test.sh` → >= 7
- **Readiness sign:** набор проверки хода работы зелёный с новыми случаями.
- **Verified by:** `bash projects/agent-kit/tests/flow-step-guard.test.sh` — строка итога с «0 провалов».

### 2. Спек, раскладка, живая проба

- **Steps:**
    1. Правило и сценарий в спеке проверки
       Check: `grep -c 'SC-AK-2016' docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md` → >= 1
    2. Раскладка пакета в дерево
       Check: `grep -c 'resolvesBlock' tools/flow-merge.mjs` → >= 1
    3. Живая проба после правки
       Check: `bash /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/611348a0-4037-4ebe-8492-719501de2c3b/scratchpad/rt-merge/probe.sh` → /^edit=pass checkout=pass newline=deny outside=deny unreviewed=deny$/
- **Readiness sign:** проба даёт «edit=pass checkout=pass newline=deny outside=deny unreviewed=deny».
- **Verified by:** `node dist/agent-kit/bin/agent-kit.js sync --check` — «разложенное сходится с пакетом».

## What this work does not do

- Не вливает `main` в ветку эпика RT-3602 и не берёт RT-3674. Когда правка стоит в движке, который судит сессию,
  это делается так: блок источника —
  правкой под сторону, разложенные копии — `git checkout --ours`, затем `pnpm run agent-kit:sync`; строка копии
  в `.claude/rt-kit/assignments.md` остаётся стороной ветки эпика.
- Не меняет строку `USAGE` в `task-flow-script.mjs`: её сведение — правка ветки задачи эпика после слияния.
- Не судит сам `git merge`: слияние непроверенной ветки без конфликта и `git merge -X ours|theirs` проходят и
  сейчас, и после правки. Это уходит отдельным предложением в приёмник.
- Не меняет, из какой папки хук берёт движок.
- Выпуск пакета идёт после слияния PR по шаблону `package-release`; хуки дерева зовут `tools/`, не пакет из npm.
