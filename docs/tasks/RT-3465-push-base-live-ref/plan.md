# Plan

**Task:** RT-3465 · **Branch:** RT-3465-push-base-live-ref
**Behaviour:** unchanged — код приложений не меняется. Меняется выбор базы набора перед отправкой пакета правил: ссылка ветки, которой нет на хостинге, базой не бывает, а проверка отправки судит то же дерево от той базы, которую взял набор.

## Points

- **A:** 21.11 набор на ветке эпика RT-3302 взял базой `origin/RT-3417-stop-hook-time`, ветку,
  удалённую на хостинге 19.11 после слияния, и шёл 1 895 с. В 03:28 соседняя сессия выполнила
  `git fetch --prune` и сняла ссылку из общей копии; в 03:34 проверка отправки взяла
  `origin/main` и отказала: «No green mark for this tree and base». Выбор базы ходит по всем
  ссылкам копии, а проверка отправки считает базу заново. С 14.11 по записям 26 таких отказов,
  в 2 базы набора и проверки разошлись: 21.11 удалённая ветка, 16.11 новая ветка эпика.
- **This task reaches:** выбор базы берёт только ветки, которые хостинг держит; проверка отправки
  для дерева, которое набор уже прошёл, берёт его базу и её коммит из записи набора; без ответа
  хостинга набор говорит об этом строкой.
- **Sign:** сценарии набора проверки отправки: ссылка удалённой ветки в копии не база; чистка
  ссылок между набором и проверкой, слияние и удаление нижней ветки во время набора, новая
  ближняя ветка во время набора — проверка отправки судит от базы набора и пропускает отправку;
  отказ называет обе базы. На нынешнем коде случай чистки ссылок красный. Видит исполнитель, числа
  в ходе работы.
- **Milestone G of the epic:** вне вехи: задача снимает повторный прогон набора на 30 минут, а не
  отказы и тупики.
- **Metric:** отказы «No green mark for this tree and base», где база набора и база проверки
  разошлись: 2 из 26 за 14–21.11, вниз до 0.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-push-marks.sh` — `rt_push_base`, запись базы набора, `rt_push_mark_key` |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh` — запись базы, строка «хостинг не ответил» |
| Code (правится) | `projects/agent-kit/assets/checks/decision-table.json` — текст отказа «No green mark» с базами |
| Code (правится) | `projects/agent-kit/tests/git-guard-push-base-live.test.sh` — новый набор, подключён из `git-guard-push-tests.test.sh` |
| Code (правится) | `projects/agent-kit/tests/git-guard-push-tests.test.sh` — ожидание SC-AK-1340 о ссылке снятой ветки |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`                        |
| Rules | `.claude/skills/git-workflow-push/`, `.claude/skills/agent-kit-source/` — читаются |

## What counts as done

- `rt_push_base` спрашивает хостинг один раз за вызов, `git ls-remote --heads origin`, и сверяет
  имя точно: `refs/heads/<имя>` до конца строки, без чтения точки как любого знака. Ссылка, которой
  нет в ответе, базой не бывает.
- Набор вперёд пишет рядом со своими отметками запись: дерево, имя базы и её коммит. Проверка
  отправки и git-хук `pre-push` для того же дерева берут базу и коммит из записи, а не считают
  заново; ключ отметки сходится по коммиту базы, даже если ветка базы сдвинулась или исчезла.
- Записи нет или дерево другое — база выбирается заново, по живым веткам хостинга.
- Хостинг не ответил — выбор идёт по ссылкам копии, и набор вперёд печатает строку «хостинг не
  ответил: база по ссылкам копии».
- Отказ «No green mark for this tree and base» называет базу проверки и базу последнего набора
  вперёд.
- Ссылки копии выбор не удаляет: `--no-prune` остаётся.
- Сценарий SC-AK-1340 о ссылке снятой с сервера ветки и решения описания «without a call to the
  host» и «A lower branch merged and removed stays the nearest one» переписаны под новое правило.
- Описание держит сценарии; разложенные копии сходятся с пакетом.

## Stages

### 1. The base is taken from the branches the host holds

Rules: one answer of the host per call filters the refs by exact name; no answer leaves the choice
to the refs of the copy and says so.

- **Steps:**
    1. A ref of a branch removed on the host is no base, and a prune between the set and the push changes nothing
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1842'` → >= 3
    2. With no answer from the host the run ahead takes the refs of the copy and prints the line
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1843'` → >= 2
- **Readiness sign:** both scenarios ok; the case of the prune is red on the code before the edit.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — exit 0.

### 2. The push judges the tree from the base of its set

Rules: the run ahead records the tree, the base and its commit; the push guard and the pre-push
hook take them for the same tree; the refusal names both bases.

- **Steps:**
    1. The push guard takes the base of the run ahead for the same tree when the lower branch is merged and removed or a nearer branch appears during the set
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1844'` → >= 3
    2. The refusal «No green mark» names the base of the push and the base of the last run ahead
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh 2>&1 | grep -c 'ok .*SC-AK-1845'` → >= 1
- **Readiness sign:** both scenarios ok, the suite ends with 0 failures.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — exit 0.

### 3. The description

Rules: the scenarios stand in the description of the push gate; the old scenario and decisions
that kept a removed branch as the base are rewritten.

- **Steps:**
    1. The scenarios stand in the description
       Check: `grep -c -E '^### SC-AK-184[2-5]' docs/specs/agent-kit/push-gate-ahead/scenarios.md` → = 4
    2. No scenario keeps the ref of a removed branch as the base
       Check: `grep -c 'Then the base is that ref' docs/specs/agent-kit/push-gate-ahead/scenarios.md` → = 0
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не чистит ссылки копии (`--prune`): чистка в одной копии меняет то, что меряет соседняя.
- Не ищет ветки, влитые хостингом, вне линии первых родителей: здесь хостинг удаляет влитые
  ветки, и фильтр живых веток их снимает; в дереве без удаления дыра остаётся. Находка рядом с
  планом эпика.
- Не меняет отбор ветки, которая несёт свою копию задачи: это RT-3426, она правит ту же функцию.
