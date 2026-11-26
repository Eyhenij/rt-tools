# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 1 of 3 — Замер до правки и решение
- **Done:** разбор записан; план прочитан тремя кругами ролей и одобрен владельцем 26.11: «Одобряю план RT-3674»
- **Next step:** коммит плана, `plan-red` и шаг 1.1
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Замер до правки записан в ход работы
- [x] 1.2 Модуль решает, печатает ли команда строку на шаг и за какой своей задачей следит
- [x] 1.3 Команда движка судит вызов Monitor
- [x] 1.4 Строка USAGE движка называет обе формы после слияния main
- [x] 2.1 Хук отказывает Monitor по своему фоновому
- [x] 2.2 Строка таблицы решений называет отказ
- [x] 2.3 Случаи набора на каждую форму входа
- [x] 2.4 Команды из записей отказаны не меньше 17 из 18
- [x] 2.5 Время хука на большой записи записано в ход работы
- [x] 3.1 Спек проверок хода называет отказ Monitor
- [x] 3.2 Привязка спека называет хук
- [x] 3.3 Спек таблицы решений называет строку хука
- [x] 3.4 Файл правила хода для дерева называет проверку
- [x] 3.5 Раздел 0.41.1 стоит в журнале изменений один раз
- [x] 3.6 Пакет разложен в дерево
- [x] 3.7 Живая проверка после раскладки записана в ход работы

## Measurements

- Замер до правки: отказано 0 из 18, живой tail -f по своему фоновому прошёл. Хука на `Monitor` в дереве нет, в
  записях проекта ни один из 18 построчных вызовов по своему фоновому не отказан. Живой вызов 26.11: фоновая
  команда `b9yk7zidq` пишет `${TMPDIR:-/tmp}/rt3674-live.log`, `Monitor` `tail -n 0 -f` по нему стартовал задачей
  `b13mmnawl` без отказа; обе сняты `TaskStop`.
- Время хука: 1,48 с на записи 338 МБ — три вызова `Monitor` `tail -f` по самой большой записи проекта
  (`05592134…jsonl`, 338 МБ в десятичных мегабайтах): 1,48, 1,41 и 1,43 с; предел плана 2 с.
- Живая проверка после раскладки: BLOCKED by monitor-stream-guard — 26.11, фоновая команда `b4e6l2ro3` пишет
  `${TMPDIR:-/tmp}/rt3674-live3.log`; диспетчер этой копии (`CLAUDE_PROJECT_DIR` — копия, `.claude/hooks/dispatch.sh
  PreToolUse`) на настоящей записи сессии отказал `tail -n 0 -f … | grep --line-buffered step` с текстом «this
  Monitor prints a line on every step of the own background task b4e6l2ro3» за 1,50 с; ожидание `until grep -q …;
  done; tail -1` по тому же файлу прошло за 1,22 с. Сам вызов `Monitor` сессии прошёл (задача `blmbk3wyq`): хуки
  сессии берутся из главной копии, где нового хука нет до слияния — предел тот же, что у RT-3691.

## Decisions along the way

- `projects/agent-kit/tests/metric-events.test.sh` — превышение следа: набор считает проверки с объявленным правилом,
  новый хук делает их 27. Строка и число правятся в том же этапе.
- `projects/agent-kit/tests/fixtures/monitor-records.tsv` — 27 строк при пределе 40; пути пользователя в нём
  заменены на `/Users/owner`, совпадения путей от этого не меняются. Ход строки таблицы решений — `say_in_words`, а
  не `work_call`: при заполненном окне `work_call` отказан, и цепочка оставалась без хода.
- Отсев хука без `node` пропускает команду без `tail` с флагом слежения и без цикла рядом со словом печати. Ожидание
  `until grep -q …; do sleep; done; tail -3` до `node` доходит и проходит по ответу движка: отсев грубее решения
  модуля. На корпусе ролей до `node` доходит около 44 из 152 вызовов.

- `projects/agent-kit/assets/checks/flow-monitor.mjs` 158 строк при бюджете до 140 — превышение: разбор команды
  с кавычками, `&`, конвейером и ключевыми словами оболочки занял 45 строк; без него конвейер `tail -f … & until
  grep -q …` (16.11 13:29) читался как одна строка и проходил. На корпусе ролей (152 вызова `Monitor`) модуль
  отказывает 18 из 18 построчных по своему живому фоновому, остальные 134 проходят.

- План переписан по двум кругам ролей до одобрения. Разбор (`grill.md`, раздел «Decisions») называет печать только
  `echo` и `printf` и совет `until grep -q` для любой задачи; план шире: печатает любая команда вывода в цикле,
  конвейер — одна команда, `until grep -q` советуется только задаче, которая сама не кончается. Судит план.
- Перечень проходящих в строке «Input» плана называет семь видов из записей; восьмой — опрос ревью через
  `gh api …/pulls/3014/reviews`, он отличается от опроса `gh pr checks` и стоит в файле данных набора. Порог шага 2.3
  (34) считан с ним.

## Sessions

### 2026-11-26

- Задача взята после слияния RT-3673 (#3690) и слияния `main` в ветку эпика (`2a7dc1a0c`); ветка от
  `RT-3602-owner-stop-holds`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/epic-3471-merge
**Branch:** RT-3674-monitor-per-line-refused

### Where we stand at the minute of the compaction

- **State:** `договорённость-записана`
- **Stage:** 1 of 3 — Замер до правки и решение
- **Next step:** коммит плана, `plan-red` и шаг 1.1
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3674-monitor-per-line-refused/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/skills/turn-conduct/implementation.md
 M docs/specs/agent-kit/decision-table/spec.md
 M docs/specs/agent-kit/turn-guards/implementation.md
 M docs/specs/agent-kit/turn-guards/scenarios.md
 M docs/specs/agent-kit/turn-guards/spec.md
 M docs/tasks/RT-3674-monitor-per-line-refused/progress.md
 M projects/agent-kit/CHANGELOG.md
 M tools/decision-table.json
 M tools/task-flow-script.mjs
?? .claude/hooks/monitor-stream-guard.sh
?? tools/flow-monitor.mjs
```

### Commits over the main branch

```
421bee742 feat(rt:agent-kit): хук отказывает Monitor, который печатает строку на каждый шаг своего фонового (RT-3674)
3393209a8 feat(rt:agent-kit): движок судит Monitor, который печатает строку на каждый шаг своего фонового (RT-3674)
5427ae649 docs(rt:agent-kit): план RT-3674 одобрен владельцем
0cf5de700 docs(rt:agent-kit): разбор и ход работы RT-3674
76bbafb6c docs(rt:agent-kit): задача 2 эпика влита, задача 3 идёт (RT-3674)
2a7dc1a0c Merge remote-tracking branch 'origin/main' into RT-3602-owner-stop-holds
861e0c95c [RT-3673] После «стоп» ход от уведомления не работает, своё фоновое снимается (#3690)
5af4812a8 docs(rt:agent-kit): папка задачи RT-3673 разобрана в архивную запись (RT-3673)
38409dc64 test(rt:agent-kit): набор метрик считает двадцать шестую проверку с правилом (RT-3673)
5142a88d0 Revert "docs(rt:agent-kit): папка задачи RT-3673 разобрана в архивную запись (RT-3673)"
577c8f688 docs(rt:agent-kit): папка задачи RT-3673 разобрана в архивную запись (RT-3673)
3fa4b012c fix(rt:agent-kit): запрет вызовов после остановки после второго круга ревью (RT-3673)
98b643448 fix(rt:agent-kit): запрет вызовов после остановки после первого круга ревью (RT-3673)
41057cb4a fix(rt:agent-kit): слово из очереди считается со времени постановки (RT-3673)
ea09cd0d5 chore(rt:agent-kit): пакет разложен в дерево (RT-3673)
41113e2a9 docs(rt:agent-kit): спеки и привязки запрета вызовов после остановки (RT-3673)
e50ca5c3d feat(rt:agent-kit): после остановки ход от уведомления не делает работу (RT-3673)
7463236ca feat(rt:agent-kit): мера остановки судит вызов и своё фоновое (RT-3673)
50ebcb6eb docs(rt:agent-kit): живая проверка хоста и замер до правки (RT-3673)
6b54f6904 docs(rt:agent-kit): план RT-3673 одобрен владельцем
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
