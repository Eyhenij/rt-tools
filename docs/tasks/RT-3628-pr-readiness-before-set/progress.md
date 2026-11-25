# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** этапы кончились, первый круг ревью исправлен
- **Done:** команда набора, её сценарии, спека и тексты цикла
- **Next step:** второй круг ревью рядом с набором
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Сценарии готовности зелёные, у каждой причины свой
- [x] 1.2 Прежние сценарии команды набора и защиты эпика зелёные, раскладка сходится
- [x] 2.1 Команда набора и защита открытия PR отвечают одно на одних ветках
- [x] 3.1 Спека названа и сходится с кодом, тексты цикла называют отказ и `--no-pr`
- [x] 4.1 Слова живых отказов, их секунды и мутанты стоят в ходе работы

## Decisions along the way

- **Мелкое из третьего чтения идёт в код, а не в план.** Помощник сам задаёт `main_branch`, `tasks_dir`, `epic_label`,
  `rt_hooks_dir` и `fact`; метка `{first}` вырезается, и сценарий это проверяет. Карточка не ответила — основа PR для
  защит дерева есть основа набора. Этап плана: 1.
- **RT-3565 стирается вместе со строкой** — ответ владельца «Стереть RT-3565 и строку (Recommended)». Строка уходит из
  плана RT-3564 отдельным коммитом в той ветке, когда копия свободна от набора. Этап плана: вне этапов.

## Sessions

### 25.11.2026

- PR 3654 задачи RT-3627 влит владельцем. Журналы 21–25.11 прочитаны: 30 открытых PR, 14 отказов по делу.
- План читали роли трижды: в первом чтении блокирующих 3, во втором 1, в третьем 0. «Одобряю план RT-3628 (Recommended)».

Живая проверка: отказ снят на этой ветке, основа и сквозной тест — в клоне с испорченной веткой.

- **Живой отказ:** «push ahead: not ready for a PR — no step started; fix the lines above and run the set again, or pass --no-pr '<reason>' for a branch that is not going into a PR yet», 7 с, шагов начато 0
- **Основа:** «the branch of the epic «RT-3624-delivery-speed» has moved ahead by 1 commits and is not merged into this branch … git fetch origin && git merge origin/RT-3624-delivery-speed», код 3
- **Сквозной тест:** «BLOCKED by e2e-coverage-guard: the branch changes code (receiver) … apps/message-bus-admin-e2e/», код 3
- **Мутанты:** 42 из 42
- Живой прогон нашёл ошибку: карточка, которой хостинг не знает, читалась как работа вне эпика. Исправлено в e21cef278.
- Три варианта первый прогон мутантов пропустил: форма имени ветки, несколько веток эпика, вторая строка в цепочке.
  К ним добавлены сценарии, прогон этих трёх — 3 из 3.

### После первого круга ревью

Блокирующих 0, серьёзных 2, остальное мелкое. Исправлено в ветке:

- Договорённость под `proposed/` держала задачу эпика, чей PR открылся бы: она больше не спрашивается (серьёзное).
- В дереве с другой главной веткой или другим каталогом задач папка держала набор: теперь «не судится» (серьёзное).
- Сломанный движок читался как готовность; движок по ссылке не судил; у причин неверные слова; довод из трёх пробелов,
  двух строк и с угловой скобкой принимался; вопрос читал ввод вызвавшего и не прерывался вместе со своим; слова о main
  короче слов защиты; отказ защиты с пустой первой строкой терялся; спека обещала больше кода; `RT_PUSH_READY_HOOKS`
  не стояла в умолчаниях; у лишнего пути следа не было выхода.

Списано: причина `--no-pr` в наблюдениях — они не держат свободного текста, пробелы и русские буквы из них вырезаются;
две русские буквы под `LC_ALL=C` — четыре байта, и знаком считается байт; прежнее имя ветки как основа — свойство основы набора, старше
этой работы; предел времени хостинга — вопрос теперь прерывается; лишние находки RT-3627 в файле эпика — коммит
следующей ветки, по порядку цикла.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3628-pr-readiness-before-set

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 из 4 — команда набора
- **Next step:** помощник `git-guard-push-ready.sh`, `flow-ready.mjs`, сценарии
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3628-pr-readiness-before-set/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3628-pr-readiness-before-set/progress.md
```

### Commits over the main branch

```
e21cef278 fix(rt:agent-kit): карточка, которой хостинг не знает, основу не судит (RT-3628)
ba5ed2b44 docs(rt:agent-kit): цикл и план эпика называют готовность PR до набора (RT-3628)
493ceb16d feat(rt:agent-kit): набор не начинается, пока PR не откроется (RT-3628)
b3de83103 docs(rt:agent-kit): ход работы RT-3628, план одобрен (RT-3628)
290ab7600 docs(rt:agent-kit): план RT-3628 (RT-3628)
880cf5d1c docs(rt:agent-kit): разбор RT-3628, находки ревью правил по RT-3627 (RT-3628)
46545ad70 [RT-3627] Задача, чей разбор дал одну, заводится без эпика (#3654)
32b460d3d docs(rt:agent-kit): папка RT-3627 разобрана в архив (RT-3627)
0276f6f2c fix(rt:agent-kit): единственная задача разбора после второго круга ревью (RT-3627)
2fc1938fe docs(rt:agent-kit): запись архива старше недели удалена (RT-3627)
d3ebc2bd8 fix(rt:agent-kit): единственная задача разбора после первого круга ревью (RT-3627)
5f4558ae6 docs(rt:agent-kit): находки по ходу RT-3627 (RT-3627)
68f421d1b test(rt:agent-kit): третий выход отказа и вызов без модуля единственной задачи (RT-3627)
a3bacf34d docs(rt:agent-kit): живая проверка и мутанты RT-3627 (RT-3627)
1952ed38c Merge remote-tracking branch 'origin/RT-3624-delivery-speed' into RT-3627-single-task-without-epic
2b3bf9162 docs(rt:agent-kit): отметка о слитой RT-3640, живая проверка RT-3627 (RT-3627)
668c46a49 docs(rt:agent-kit): закон, правила и спеки называют единственную задачу разбора (RT-3627)
b12263d45 feat(rt:agent-kit): защиты знают единственную задачу разбора (RT-3627)
d0ef55f0c feat(rt:agent-kit): единственная задача разбора заводится без эпика (RT-3627)
4aaa89b8a feat(rt:agent-kit): движок ведёт работу вне эпика дальше второго шага (RT-3627)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
