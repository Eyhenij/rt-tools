# turn-conduct — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом. Ход работы от просьбы владельца
до слияния, состояния работы и папка задачи — правило `task-flow`, и своё у него лежит в
`implementation.md` при нём; пороги окна и имена стражей названы там же.

## Как это называется здесь

- **В правиле** — Здесь
- **правило хода работы** — `task-flow` — его компаньон называет пороги окна, размер окна и место передачи

## Где это лежит

- **стражи выходов хода** — `.claude/hooks/` — страж выходов, гард ожидания, гард разговора, гард происшествия, страж окна

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение.

- **Someone else's step is of two kinds, and the second never ends by itself.** — Не проверяется машиной: отбитое разрешение от идущего прогона гарду неотличимо. Непройденное называется разделом тела заявки — его отбивает `.claude/hooks/git-guard-delivery.sh`.
- **A summary of someone else's step.** — `.claude/hooks/waiting-turn-guard.sh:taken_re` — ход, в котором открыт PR или прочитан красный прогон, не закрывается без действия по следующей задаче
- **A declaration of intent.** — `.claude/hooks/waiting-turn-guard.sh:taken_re` — слова о взятой задаче гард действием не признаёт, признаются команды
- **Work named as a command is run in the turn that names it.** — **Не проверяется ничем.** Страж видит команды хода и не сверяет названную в ответе команду с запущенной: пустой ход он отбивает, а ход, где запущено другое, — нет
- **One's own unclosed step is not handed to the owner.** — **Не проверяется ничем.** Страж выхода хода отвечает на вопрос «была ли работа», и на ход, где работа была, а её отдача не сделана, он говорит «да»; гард поставки о невызванной команде молчит по устройству
- **A menu under an assigned order.** — **Не проверяется ничем.** Вопрос владельцу инструментом не является: спрашивают чаще прозой, чем меню
- **A word about one's own work is judged by what the same turn did.** — **Не проверяется ничем.** Страж выхода видит команды хода и не читает того, что ход обещал: обещание живёт в тексте ответа, а сверить его с работой можно только пониманием смысла
- **An option offered to the owner is named with its cost to a person.** — **Не проверяется ничем.** Цена варианта для человека машине не видна вовсе: она считает шаги команды, а не шаги того, кто ею пользуется
- **A tree state the owner named is cleared by a call before an explanation.** — **Не проверяется ничем.** Слово владельца живёт в переписке и следа в дереве не оставляет: гарду видно, что вызвано, но не то, о чём его просили. Держится порядком правила и разбором запись «2026-08-27-conflicts-named-not-checked» в приёме.
- **A retelling of the current order without an appraisal reads as approval.** — **Не проверяется ничем.** Гард утверждения судит слова о состоянии дерева и требует команду; оценку годности он не спрашивает — её нечем подтвердить командой
- **A file path is never an assignment.** — **Не проверяется ничем.** Отличить реплику без действия от короткого поручения гарду нечем: он судит файлы и команды, а не текст просьбы
- **An interruption of work by the owner is named aloud.** — **Не проверяется ничем.** Гарды судят файлы и команды, а не текст ответа владельцу
- **A stop is named in a message of its own.** — **Не проверяется ничем.** Гарды судят файлы и команды, а не текст ответа владельцу
- **The waiting guard's refusal is lifted by both actions at once.** — `.claude/hooks/waiting-turn-guard.sh:verdict` — вердикт «ни одного из двух» называет оба недостающих действия
- **Work left in the working tree does not end the turn.** — `.claude/hooks/turn-exit-guard.sh:rt_te_deny` — ярус читает `@{u}..HEAD` локально и молчит там, где удалённой ссылки нет
- **Turn exits are watched by a guard, not by the executor's memory.** — `.claude/hooks/turn-exit-guard.sh:verdict` — ход без правки и без команды, меняющей дерево, возвращается исполнителю
- **The word about a stop the guard reads from the owner, not from the executor.** — `.claude/hooks/turn-exit-guard.sh:told_stop` — судится реплика владельца, а не текст ответа
- **The phrase "waiting for your word" is a stop declared by the executor, and the guard refuses it by name.** — `.claude/hooks/turn-exit-guard.sh:awaits_word` — набор образцов фразы назван в разборе записи хода; ярус стоит до законных выходов
- **Work without a branch and without a task folder is judged by the same guard by the second sign.** — `.claude/hooks/turn-exit-guard.sh:state` — ветка, папка задачи и строка состояния берутся, пока они есть; пустое состояние ход не кончает, а переводит суд на признак работы
- **A taken task is not yet begun work, and the turn does not end on it.** — `.claude/hooks/turn-exit-guard.sh:task_key` — ключ задач берётся из `.claude/rt-kit/checks.json`, ветка сверяется с образцом `<КЛЮЧ>-<номер>-`, а признаком служит отсутствие каталога `docs/tasks/<ветка>`
- **Exploration does not end a turn, however much of it there is.** — `.claude/hooks/turn-exit-patterns.sh:read_re` — образец читающих подкоманд `git` и клиента хостинга; `part_re` рядом делит составную команду на части, и работой считается часть, совпавшая с образцом работы и не совпавшая с образцом разведки
- **A reply to the owner is not an action and does not stand last in a turn.** — `.claude/hooks/turn-exit-guard.sh:ended_working` — судится последнее действие хода, а текст ответа действием не считается вовсе
- **The last action of a turn is only ever work.** — `.claude/hooks/turn-exit-guard.sh:ended_working` — правка файла либо меняющая часть последней команды; частные ярусы `waited`, `handed_over` и `read_re` из этого признака только выводят понятный отказ
- **Waiting for someone else's step is never the last action of a turn.** — `.claude/hooks/turn-exit-patterns.sh:wait_re` — образец ожидания сверяется с последней командой хода, а не со всеми: ожидание в середине законно, отбивается только конец
- **The handover is written even where the branch has no name.** — `.claude/hooks/handoff-write.sh:handoff_name` — имя файла берётся коротким снимком головы, когда имени у ветки нет
- **A plan stage is declared closed only after its check command has passed.** — `.claude/hooks/turn-exit-guard.sh:contract` — команда берётся из строки «Чем проверяется» замысла
- **A statement about the tree's state is watched by the statement guard, not by the executor's memory.** — `.claude/hooks/claim-guard.sh:claims` — у каждого слова-утверждения свой род команды, и ищется она в том же ходе; сценарии — `projects/agent-kit/tests/claim-guard.test.sh`
- **The statement guard waits for the reply text rather than judging the record as it found it.** — `.claude/hooks/hook-input.sh:rt_turn_has_text` — запись перечитывается короткими попытками; не дождавшийся текста ход возвращает `.claude/hooks/claim-guard.sh`; сценарии — `projects/agent-kit/tests/claim-guard.test.sh`
- **The guard catches a statement word, not a wrong conclusion.** — `.claude/hooks/claim-guard.sh:claim-guard` — гард знает слова и команды и не знает, верен ли вывод; эти случаи держат статьи правила
- **A session begun from a handover enters the work by the same rule as any other.** — `.claude/hooks/handoff-entry-guard.sh:verdict` — правка отбивается, пока правило ведения работы за заход не загружено
- **A turn about someone else's step is watched by the waiting guard, not by the executor's memory.** — `.claude/hooks/waiting-turn-guard.sh:opened_re` — признак берётся из команд хода и их вывода, сети гард не трогает; сценарии — `projects/agent-kit/tests/waiting-turn-guard.test.sh`
- **A turn that handed work in carries it to a lifted draft.** — `.claude/hooks/waiting-turn-guard.sh:ready_re` — ход, открывший заявку, не кончается, пока состояние отданной работы не спрошено командой; сценарий SC-AK-583
- **"Waiting for the run" is a statement about someone else's step, not a work state.** — `.claude/hooks/claim-guard.sh:claims` — слова об ожидании прогона требуют команды, его показывающей; сценарии SC-AK-581, SC-AK-582
- **The end of a run is learned from the return of a background command, not from a look at the page.** — **Не проверяется ничем.** Гард видит команды хода, но не может судить, запущено ожидание в фоне или нет; держится этой статьёй
- **A command refused by a gate is repeated whole, not by its tail.** — **Не проверяется ничем.** Гейт отбивает вызов и о следующем не знает: повторённый хвост для него — обычная новая команда. Держится чтением отказа: он называет, чего не хватает, и не разрешает делить команду
- **A writing call is not appended to an exploration line.** — **Не проверяется ничем.** Признак записи файла командой оболочки в `.claude/rt-kit/defaults/project.sh:rt_shell_writes_default` ловит правку под гардами, но законную связку от дописанной в разведку не отличает — обе формы законны
- **Waiting for one's own measurement is done with one wait, not a notification on every step.** — **Не проверяется ничем.** Сколько ожиданий поставлено на замер, гарду не видно: он судит последнее действие хода. Держится этой статьёй.
- **A guard's refusal ends the turn.** — **Не проверяется ничем.** Гард знает свой отказ и не знает, что было после него; обход же ловится тем, что гарды судят и команду оболочки — сценарии второй двери есть у каждого гарда, отбивающего правку файла: `projects/agent-kit/tests/task-flow-guard.test.sh`, `projects/agent-kit/tests/reuse-guard.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`
- **The state of unfinished work comes into the context at session start.** — `.claude/hooks/task-context-load.sh:emit` — замысел и ход работы отдаются целиком, разбор просьбы — путём
- **The session's window fill is watched by a guard, not by the executor's memory.** — `.claude/hooks/window-fill-guard.sh:stop_pct` — размер окна `RT_WINDOW_TOKENS` в `.claude/settings.json`, пороги 40% и 50%
- **The context compaction threshold the tree sets itself, and it stands BELOW the stop threshold.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift` — здесь окно `autoCompactWindow` в `.claude/settings.json` равно миллиону, доля сжатия 45%, доля остановки 50%, запас `RT_WINDOW_MARGIN_PCT` 5%
- **A filled window ends a turn only where there is no compaction.** — `.claude/hooks/window-fill-guard.sh:compact_pct` — здесь сжатие объявлено, и первый порог зовёт работать дальше
- **A session closes with a handover, and it lies as a section of the progress.** — `.claude/hooks/handoff-write.sh:section` — раздел «Передача захода» в `docs/tasks/<ветка>/progress.md`; запасной путь для работы без папки задачи — `.claude/handoff/`, он в `.gitignore`
- **A refusal of an irreversible action has a safe part, and it is done.** — **Не проверяется ничем.** Ход, в котором сделана часть работы вместо всей, машине неотличим от хода, в котором сделано всё; держится этой статьёй и разбором происшествия
- **The sign of irreversibility is taken from the list, not derived by argument.** — **Не проверяется ничем.** Гард судит форму вызова, а не довод, по которому исполнитель решил спросить владельца; держится статьёй правила и списком в `.claude/skills/task-flow/implementation.md`
- **A turn in which the executor admitted a miss does not end until the incident record exists.** — `.claude/hooks/postmortem-guard.sh:notes_dir` — каталог черновиков здесь `.claude/rt-kit/postmortems`, он вне истории и назван ключом `postmortems` в `.claude/rt-kit.json`; признание ловится набором образцов
- **A turn in which a question was put to the owner does not end until laws and rules were read in that same turn.** — `.claude/hooks/grill-gate.sh:verdict` — каталоги чтения здесь `docs/constitution`, `.claude/skills`, `docs/specs`
- **The owner's answer is sought in their own messages before the rules.** — **Не проверяется ничем.** Гард разговора судит след инструментов за ход — загрузку правила, чтение файла законов, поиск по ним; реплика владельца следа не оставляет, и «читал ли он её» не отличается от «прочитал внимательно»
- **The size of work is never a reason to cut its boundaries.** — **Не проверяется ничем.** Оценку «это слишком дорого» назначал бы тот, кому дорого; машине объём виден, а названные владельцем границы — нет
- **The actions the executor does not do without the owner's word are listed in the rule's companion.** — `.claude/hooks/git-guard-delivery.sh:deny` — он судит пуш и открытие заявки по форме: имя ветки, подпись коммита, номер в заголовке, колонку задачи. Слова владельца гард не спрашивает нигде: сам список — раздел «Что не делается без слова владельца» в `.claude/skills/task-flow/implementation.md`, и держится он памятью исполнителя
- **A removed task folder lifts the state requirement and does not end the turn.** — `.claude/hooks/turn-exit-guard.sh:folder_archived` — папка, снятая коммитом ветки, уводит суд на второй признак; сценарии — `projects/agent-kit/tests/turn-exit-guard.test.sh`
- **An option that silences a check is not put in the menu at all.** — **Не проверяется ничем.** Меню собирается инструментом вопроса, и что в нём стояло, следа не оставляет: гард разговора судит, читались ли правила до вопроса, а не из чего собран список ответов
