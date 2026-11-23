# Plan

**Task:** RT-3466 · **Branch:** RT-3466-push-set-pinned-node
**Behaviour:** unchanged — код приложений не меняется. Меняется набор перед отправкой пакета правил: его шаги идут на node, которую дерево закрепило в `.nvmrc`, а не на первой в `PATH` хука.

## Points

- **A:** 21.11 проверка отправки ветки эпика RT-3302 сама прогнала лёгкие шаги набора на node
  20.11.0, первой в `PATH` хука, и показала четыре красных: `agent-kit:check` и `lint:styles` —
  «Expected node >=22.22.3, got v20.11.0», `check-tokens-styles` — `ERR_REQUIRE_ESM`,
  `check-schema-drift` — `styleText is not a function`. На node 22 те же шаги зелёные. В записях
  сессий с 14.11 таких отказов 4 из 36, все в одной сессии; пятый красный шаг тех отказов,
  `tools/tests/run.sh`, от node не зависит и задачей не снимается. Набор вперёд из той сессии
  получал от pnpm 9 под node 20 `ERR_PNPM_UNSUPPORTED_ENGINE`. Перемер
  перед PR уже ставит node из `.nvmrc` первой; проверка отправки, хук git перед отправкой и набор
  вперёд — нет. 23.11 пробная отправка из клона с node 20 первой даёт 1 строку неверной node.
- **This task reaches:** шаги набора идут на закреплённой node во всех трёх местах; если её нет на
  машине и node в `PATH` другая, отправка отказана одной строкой с командой установки, а не
  красными шагами и не советом «почини шаги».
- **Sign:** настоящая отправка из клона с node 20 первой в `PATH` проходит хук git без строк
  «Expected node», `ERR_REQUIRE_ESM` и `styleText`: каждый из четырёх шагов карточки зелёный или не
  выбран; с закреплённой node, спрятанной от хука, — одна строка о версии и отказ. Видит
  исполнитель, числа в ходе работы.
- **Milestone G of the epic:** вне вехи: задача снимает ложные красные шаги отправки, а не
  отказы и тупики хода.
- **Metric:** нет: ремонт — набор шёл на node хука, а не дерева.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/hooks/facts.sh` — общая функция: каталог закреплённой node или строка о несовпадении |
| Code (правится) | `projects/agent-kit/assets/hooks/push-set.sh` — `PATH` шагов, строка вместо шагов |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh` — тот же `PATH` в своём цикле |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`, `projects/agent-kit/assets/hooks/pre-push.sh` — отказ строкой о версии |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-delivery-rerun.sh` — зовёт общую функцию |
| Code (правится) | `projects/agent-kit/assets/checks/decision-table.json` — строки отказа о версии node у двух хуков |
| Code (правится) | `projects/agent-kit/tests/push-set-runs.test.sh`, `git-guard-push-tests.test.sh`, `pre-push.test.sh` |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`                        |
| Rules | `.claude/skills/git-workflow-push/`, `.claude/skills/agent-kit-source/` — читаются |

## What counts as done

- Одна функция в `facts.sh` читает `.nvmrc` корня копии и отдаёт каталог
  `${NVM_DIR:-$HOME/.nvm}/versions/node/v<версия>/bin`. Закрепление мажора или минора берёт
  старшую установленную подходящую версию; псевдоним (`lts/*`, `node`) и дерево без `.nvmrc` —
  ничего, как прежде.
- Набор (`rt_push_set_run`), набор вперёд и перемер перед PR ставят этот каталог первым в `PATH`
  на всё время набора: и шагов, и выбора шагов (`rt_push_select`, `rt_push_subjects`).
  `push-set.sh` и `git-guard-push-ahead.sh` подключают `facts.sh` сами; строки `Requires`
  дополнены.
- Каталога нет, а node в `PATH` равна закреплённой — шаги идут как прежде.
- Каталога нет и node в `PATH` другая — ни один шаг не идёт; проверка отправки и хук git
  отказывают своей строкой таблицы решений: какая версия закреплена, какая в `PATH`, команда
  `nvm install <версия>`. Пустой набор в этом случае отправку не пропускает.
- Описание держит сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. The steps of the set run on the pinned node

Rules: one function names the directory of the pinned node; the set, the run ahead and the rerun
put it first; a missing pin with another node in `PATH` is one refusal line in both callers.

- **Steps:**
    1. A step of the set and of the run ahead sees the pinned node when another stands first in PATH
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-set-runs.test.sh 2>&1 | grep -c -E 'ok .*SC-AK-1846 — (the set|the run ahead) sees the pinned node'` → = 2
    2. A pin of a major takes the highest installed match; an alias and a tree without a pin run as before
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-set-runs.test.sh 2>&1 | grep -c -E 'ok .*SC-AK-1846 — (a major pin|an alias pin|no pin)'` → = 3
    3. A pinned node not installed with another node in PATH refuses the push by one line in the guard and in the git hook
       Check: `{ VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1; VERBOSE=1 bash projects/agent-kit/tests/pre-push.test.sh 2>&1; } | grep -c 'ok .*SC-AK-1847 — not installed'` → = 2
    4. A pinned node not installed with the same node in PATH runs the steps as before
       Check: `VERBOSE=1 bash projects/agent-kit/tests/push-set-runs.test.sh 2>&1 | grep -c 'ok .*SC-AK-1847 — same node in PATH'` → = 1
    5. A real push from a clone with node 20 first goes through the git hook with no line of a wrong node
       Check: `bash docs/tasks/RT-3466-push-set-pinned-node/live-push.sh` → = 0
- **Readiness sign:** all named cases ok, the three suites end with 0 failures; the cases of steps
  1 and 3 are red on the code before the edit; the decision table passes its probes.
- **Verified by:** `bash projects/agent-kit/tests/push-set-runs.test.sh && bash projects/agent-kit/tests/git-guard-push-tests.test.sh && bash projects/agent-kit/tests/pre-push.test.sh` — exit 0.

### 2. The description

Rules: the scenarios stand in the description of the set and the run ahead, bound to the code.

- **Steps:**
    1. The scenarios stand in the description
       Check: `grep -c -E '^### SC-AK-184[67]' docs/specs/agent-kit/push-gate-ahead/scenarios.md` → = 2
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0;
  `npm run -s agent-kit:check` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не читает другие менеджеры node (fnm, volta) и поле `engines`: на этой машине nvm; дерево с
  `engines` без `.nvmrc` остаётся на node хука — находка рядом с планом эпика.
- Не меняет `PATH` проверок хука вне набора: чтение доски, разметка и отказы идут на node хука.
- Не трогает красный `tools/tests/run.sh` из тех же отказов: он от node не зависит.
