# Grill

## The owner request

Текст задачи #3355:

> Каждая из 82 проверок пакета решает сама за себя. Таблица решений из RT-3275 описывает все их
> решения в одном месте, но проверки её не зовут: правка правила в проверке и в таблице
> расходится, и тест перебора перестаёт описывать то, что агент встречает на деле.
>
> Проверки берут решение из таблицы RT-3275, а не держат своё. Отказ называет ход, который
> таблица разрешает. Проверки, у которых не остаётся своего кода, удаляются.
>
> - Каждая проверка пакета берёт решение из таблицы; поиск по файлам проверок не находит решений
>   мимо неё.
> - Число файлов проверок в пакете названо до и после.
> - Тест перебора RT-3275 зелёный после переключения.

Задача отделена от RT-3275 словом владельца «Две задачи». Эпик RT-3302 идёт по слову «делай эпик
дальше».

## What the tree already has

- `projects/agent-kit/assets/checks/decision-table.json`: 999 rows, 85 entries in `hooks` (31
  guards, 52 `.sh` helpers, 2 models). `decision-table.mjs --validate` takes 0.05 s; a bare node
  start takes 0.03 s.
- 83 `.sh` files in `projects/agent-kit/assets/hooks/`.
- About 70% of the code of the delivery guard and its 11 helpers gathers facts (git, board, host);
  its decisions are spread over 37 `fault`/`deny` calls.
- Most rows are composition rows: a refusal row repeated for each neighbour state (window, exam,
  rule loaded) under which its named move is refused. That gives the delivery guard 394 rows,
  task-flow-guard 150 and task-flow-draft-guard 100. Computed instead of stored, they drop about
  600 rows.
- `rt_move_first` in `deny-tail.sh` re-runs up to eight neighbour guards as subprocesses, to the
  depth of three; it is the slowest part of a refusal.
- Facts are computed more than once: the branch in about 12 hooks by three different git commands;
  `origin/main` in four; the conversation record is parsed in five hooks; the window marker is read
  in three.
- Three guards already hand the decision to node: flow-step, tree-assignment, turn-exit.
- Four guards judge content, not state: prose style, qa-dataid, reuse-first, SQL parsing; their
  rows carry no facts.
- `pre-push.sh` and `commit-msg.sh` refuse by `exit 1` and are marked helpers (open question Q-2 of
  the decision-table spec).
- Open question Q-1 of the same spec: the conform mode checks a row against its hook, not a refusal
  against the rows; the reverse probe was given to this task.

## What the rules already say

- The rule `agent-kit-source`: edit, build, lay out; nothing builds the package while the push set
  runs.
- The rule `testing`: a guard lets the action through when it is itself broken (FAIL-OPEN); the
  call sign errs towards firing too often.
- The spec `docs/specs/agent-kit/decision-table/`: a refusal names a move allowed in the same state;
  the walk fails on a dead state or an unnamed pair.

## Questions and answers

**Как проверки берут решение из таблицы?** Варианты: «Один решатель (Recommended)» — проверка на
bash собирает факты и зовёт одну программу, строки отказа под соседом вычисляются; «Таблица в
bash» — код на bash собирается из таблицы при раскладке.
Ответ: «Один решатель (Recommended)».

**Что делать с четырьмя проверками содержимого (стиль текста, qa-dataid, переиспользование,
SQL)?** Варианты: «Анализ — это факт (Recommended)» — разбор остаётся и выдаёт факт, решение и
текст из таблицы; «Оставить как есть».
Ответ: «Анализ — это факт (Recommended)».

**Вносить git-хуки `pre-push.sh` и `commit-msg.sh` в таблицу?** Варианты: «Да, в таблицу
(Recommended)»; «Нет, помощники».
Ответ: «Да, в таблицу (Recommended)».

**Делить RT-3355 на задачи?** Варианты: «Одна задача, этапы (Recommended)»; «Задача на область».
Ответ: «Одна задача, этапы (Recommended)».

## Decisions

The four answers took the recommended option; the remaining questions are closed by assumption.

- **Behaviour of the application: unchanged.** The edit touches only the rules package and its
  layout, no `apps/**` or `libs/**`.
- **No law is edited.** The spec of the decision table and the hook specs change; the package rules
  are edited only where they name a hook mechanism that goes away.
- **What the task does not do:** no check starts to allow or forbid anything it decides
  differently today — the conform mode stays at 0 mismatches over the same probes; the content
  analysis of the four checks is not rewritten; the guards of this tree outside the package are not
  touched.
- **What shows the task closed:** the three signs of the task; plus the reverse probe (Q-1) green,
  the git hooks have rows (Q-2 closed), and the package suites green.
- **Sample:** the three guards that already hand the decision to node (`flow-step-guard.sh`,
  `tree-assignment-guard.sh`, `turn-exit-guard.sh`) — a bash shell around a node verdict.

## What is left unclear

- The exact shape of the fact collectors per area is decided by the plan, by measurement over the
  hooks, not asked.
