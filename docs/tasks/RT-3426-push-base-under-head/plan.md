# Plan

**Task:** RT-3426 · **Branch:** RT-3426-push-base-under-head
**Behaviour:** unchanged — код приложений не меняется. Меняется выбор базы набора перед отправкой пакета правил: ветка эпика, которая несёт старую копию ветки задачи через слияние или лежит под вершиной, не отбрасывается как «стоящая на этой».

## Points

- **A:** 19.11 набор перед отправкой RT-3276 взял базой главную ветку (09:36Z, вершина
  `43b0ab128`), прогнал всё и через 22 минуты покраснел на снимках витрины; повтор позеленел в
  10:09Z — около 33 минут вместо нескольких. Копия ветки задачи на сервере, `f58ca0746`, попала в
  ветку эпика 15.11 через чужую заявку #3351 (RT-3329), слияние хоста `459bdf5c3`; эпик задача
  приняла только 19.11 в 17:10. Выбор базы отбрасывает каждую ветку, которая несёт свою копию
  ветки задачи, — и ветку эпика: и когда она под вершиной, и когда ушла вперёд, и когда вершина
  стоит ровно на ней. В записях сессий с 14.11 это единственный такой заход из 85 строк базы.
- **This task reaches:** ветка отбрасывается за свою копию, только когда копия лежит на её линии
  первых родителей — ветку взяли от этой и вели обычными коммитами; ветка под вершиной или на её
  коммите не отбрасывается. На повторе истории 19.11 и во всех историях ролей база набора — ветка
  эпика.
- **Sign:** случаи сценария SC-AK-1340 на настоящих репозиториях: эпик под вершиной несёт копию;
  эпик ушёл вперёд и несёт копию через слияние хоста — задача эпик принимала и не принимала; вершина
  стоит на эпике — база ветка эпика, и на коде до правки все четыре красные; ветка, взятая от этой
  ветки, по-прежнему отброшена, и та же ветка после слияния хоста сверху — тоже. Видит исполнитель,
  числа в ходе работы.
- **Milestone G of the epic:** вне вехи: задача снимает полный набор на 33 минуты, а не отказы и
  тупики.
- **Metric:** нет: ремонт — выбор базы отбрасывал ветку эпика, которая несёт копию задачи.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/hooks/git-guard-push-marks.sh` — `rt_push_base`, отбор ветки со своей копией, комментарий функции |
| Code (правится) | `projects/agent-kit/tests/git-guard-push-base-live.test.sh` — новые случаи SC-AK-1340 |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`                        |
| Rules | `.claude/skills/git-workflow-push/`, `.claude/skills/agent-kit-source/` — читаются |

## What counts as done

- Ветка отбрасывается за свою копию, только когда `own` лежит на линии первых родителей ветки
  (`git rev-list --first-parent <ref>`) и ветка не под вершиной: копия пришла слиянием — хоста или
  чьим-то ещё — ветку не отбрасывает. Одно условие вместо цикла по слияниям хоста.
- Ветка, которая лежит под вершиной или на её коммите, за свою копию не отбрасывается: содержимое
  этой ветки уже прошло набор.
- `own` берётся из ссылки копии, как прежде, и после правки RT-3465: ветку задачи хостинг удаляет
  после слияния заявки, ссылка в копии остаётся, и решает линия первых родителей, а не жизнь
  ссылки. Случай «копия снята на хостинге, ссылка осталась» это держит.
- Ветка, взятая от этой ветки обычными коммитами, отбрасывается, как прежде, — и после того, как
  хост влил в неё ветку выше по стопке.
- Комментарий функции и строка правила в описании называют новое условие.
- Прежние случаи SC-AK-1340 печатают прежнее, кроме тех, что переписала RT-3465.
- Описание держит случаи; разложенные копии сходятся с пакетом.

## Stages

### 1. A branch carries the own copy by a merge or under the head, and it stays a base

Rules: the drop for the own copy asks whether the copy lies on the first-parent line of the branch
and whether the branch lies under the head or at it; a branch taken from this one by plain commits
stays dropped.

- **Steps:**
    1. The epic under the head that carries the copy is the base
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-base-live.test.sh 2>&1 | grep -c 'ok .*SC-AK-1340 — эпик под вершиной несёт копию'` → = 1
    2. The epic ahead of the head that carries the copy by a host merge is the base, whether the task took the epic in or not
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-base-live.test.sh 2>&1 | grep -c 'ok .*SC-AK-1340 — эпик впереди несёт копию слиянием хоста'` → = 3
    3. The head at the commit of the epic takes the epic as the base, and the copy removed on the host changes nothing
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-base-live.test.sh 2>&1 | grep -c -E 'ok .*SC-AK-1340 — (вершина на эпике|копия снята на хостинге)'` → = 2
    4. A branch taken from this one by plain commits stays dropped, a host merge of a higher branch into it included
       Check: `VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-base-live.test.sh 2>&1 | grep -c 'ok .*SC-AK-1340 — ветка, взятая от этой, не база'` → = 2
    5. No former case of the scenario is lost: the 20 cases of the push suite and the 8 new ones
       Check: `{ VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-tests.test.sh; VERBOSE=1 bash projects/agent-kit/tests/git-guard-push-base-live.test.sh; } 2>&1 | grep -c 'ok .*SC-AK-1340'` → >= 28
- **Readiness sign:** both suites end with 0 failures; the cases of steps 1–3 are red on the code
  before the edit; the 20 former cases (20 by the run of 23.11) and 8 new ones are ok, 28 in all.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-base-live.test.sh` and
  `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — exit 0.

### 2. The description

Rules: the cases stand in the scenario of the choice, the rule names the copy by a host merge and
the branch under the head.

- **Steps:**
    1. The rule of the description names the new condition
       Check: `grep -c 'own copy on its first-parent line' docs/specs/agent-kit/push-gate-ahead/spec.md` → >= 1
    2. The scenario names the cases
       Check: `grep -c 'own copy on its first-parent line' docs/specs/agent-kit/push-gate-ahead/scenarios.md` → >= 1
- **Readiness sign:** `node tools/check-specs.mjs` and `npm run -s check:spec-coverage` exit 0.
- **Verified by:** `node tools/check-specs.mjs` — exit 0.

## What this work does not do

- Не меняет, как проверка отправки судит удаление старой копии ветки с сервера: после правки
  удаление судится от той же базы, что отправка, — от ветки эпика.
- Не меняет фильтр живых веток и закреплённую базу RT-3465: условие ложится на ту же функцию после
  неё.
- Не ловит копию, которая попала в эпик слиянием сессии, а не хоста, когда задача эпик не
  принимала: эпик снимает строка о сдвиге не хостом, и база остаётся главной веткой. С 14.11 таких
  случаев в записях 0.
