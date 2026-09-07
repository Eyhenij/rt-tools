# task-flow — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом.

Дерево публикует библиотеки и держит одно приложение — приёмник груза. **Домен здесь — пакет в
`projects/` или приложение**: `ui-kit`, `ui-kit-v2`, `core`, `store`, `utils`, `agent-kit`,
`message-bus`. Спек пакета описывает публичную поверхность — что он обещает потребителю; спек
приложения описывает предметную область: что оно принимает, что хранит и чем отказывает.

## Как это называется здесь

- **В правиле** — Здесь
- **домен** — пакет в `projects/` или приложение в `apps/` — каталог спека на каждый
- **очередь работ** — задачи GitHub и доска `Rt-tools`; номер задачи стоит в имени ветки
- **папка задачи** — `docs/tasks/<ветка>/` — путь повторяет имя ветки буквально, вместе с косой
- **замысел эпика** — `docs/plans/<тема>.md` — каталог заведён раньше правила и используется
- **разбор просьбы** — вопросы владельцу инструментом опроса, ответы дословно в `grill.md`
- **разбор замысла ролями** — `.claude/workflows/plan.js`
- **переименование папки под номер** — делает `npm run task:new`: черновик по слагу становится папкой по имени ветки
- **сборка папки задачи** — делает он же: копирует `docs/tasks/_template` и снимает с копий шапку раскладки

## Где это лежит

- **Папки задач** — `docs/tasks/`, образец — `docs/tasks/_template/`
- **Договорённость о продукте до кода** — `docs/specs/<пакет>/proposed/<фича>/`
- **Спек пакета** — `docs/specs/<пакет>/`
- **Замысел эпика** — `docs/plans/`
- **Роли разбора** — `.claude/agents/spec-writer.md`, `.claude/agents/spec-critic.md`
- **Конвейер после разбора** — `.claude/workflows/plan.js`

## Что не делается без слова владельца

Слово даётся на действие, а не на работу целиком: «делай, что нужно по плану» разрешает то,
что в плане названо, и ничего сверх того.

- **Действие** — Почему оно здесь
- **слияние PR в главную ветку** — назад одним движением не откатывается
- **публикация пакета в реестр** — опубликованную версию не снять
- **правка тела уже заведённой задачи или PR** — это текст владельца, а не рабочая запись
- **снятие ветки, рабочего дерева или папки задачи** — снесённое восстанавливается только из истории, а незакоммиченное — ничем
- **правка рабочего дерева не своей правкой** — выкладка чужой версии поверх дерева и сброс к чужой вершине стирают то же
- **правка файлов вне корня рабочего дерева** — замысел этой ветки ими не распоряжается

Коммит в свою ветку сюда не входит: он не уходит наружу и откатывается.

**Пуш ветки задачи и открытие PR черновиком отсюда сняты.** Стояли они здесь оба, и вместе с
ними стоял запрет на то, чего правило требует прямо: PR открывается черновиком тем ходом,
которым правка отдаётся, — а без пуша его не открыть. Работа от этого простаивала готовой и
невидимой, дожидаясь слова, которого владелец не ждал: страж выхода требовал открыть заявку,
этот список — не открывать, и разрешить противоречие исполнителю было нечем.

Оба шага обратимы, а необратимо только слияние, и оно в списке осталось. Ветка снимается, заявка
закрывается, а кнопка слияния у черновика заблокирована самим хостингом: пока черновик не снят,
открытая заявка приглашением влить не читается. Снятие черновика тоже остаётся за исполнителем —
им он и говорит, что решение готово, — и стережёт его свой гард: он смотрит разбор, сливаемость
и прогон на вершине заявки.

Строка о правке рабочего дерева не своей правкой заведена разбором
запись «2026-08-20-diagnostic-command-overwrote-the-tree» в приёме: список называл снос —
ветки, рабочего дерева, папки задачи, — и выкладка чужой версии поверх дерева в него не
попадала, хотя стирает ровно то же и тем же способом.

## Как закон применяется здесь

- **Папка задачи заводится вместе с веткой, а не после первой правки.** Путь повторяет имя
  ветки буквально: `RT-334-archive-closed-task-folders` →
  `docs/tasks/RT-334-archive-closed-task-folders/`. Ветку старой формы, с косой, косая на дефис
  не заменяется — так папку ищут `task-context-load.sh` и `task-flow-guard.sh`, и папка,
  названная иначе, не находится ничем.
- **Просьба владельца ложится в `grill.md` дословно.** Пересказ подгоняется под уже сделанное;
  дословная запись — единственное, с чем можно сверить результат при приёмке.
- **`plan.md` после написания не правится.** Пересмотр этапа пишется в `progress.md` как
  решение по ходу, с доводом.
- **Сделанное отмечается только в `progress.md`.** Вторая запись об этом же — в теле коммита,
  в описании PR, в плане — разъезжается с первой молча.
- **Договорённость о поведении компонента пишется до кода** и живёт в
  `docs/specs/<пакет>/proposed/<фича>/`, пока ветка не влита.

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь».
Пока в таблице только то, что стережёт разбор папки задачи: остальные статьи правила привязок
не имеют — это долг, лежавший здесь до этой таблицы.

- **Editing application code is refused until the work has reached a state in which code is edited.** — `.claude/hooks/task-flow-guard.sh:plan` — папка по имени текущей ветки, замысел в ней и объявленное состояние; без любого из них правка кода отбивается
- **The guard judges the declared transition, not the presence of files.** — `.claude/hooks/task-flow-guard.sh:state` — строка состояния читается из хода работы, и отказ снимает она, а не лежащий на диске файл
- **A refusal by state names the mandatory action of the declared state.** — `.claude/hooks/task-flow-guard.sh:state_action` — обязательное действие каждого допереходного состояния
- **Only a word from the list counts as a state name.** — `.claude/hooks/task-flow-guard.sh:state_action` — слово вне перечня отбивается отдельной причиной
- **After opening the PR, the executor tells the owner the number, what it waits for and what comes next.** — **Не проверяется ничем.** Гарды судят файлы и команды, а не текст ответа владельцу; сказанное в переписке следа в дереве не оставляет
- **Editing application code is refused until the work has reached a state in which code is edited.** — `.claude/rt-kit/project.sh:RT_ARCHIVE_PRUNE_CMD` — `node tools/archive-prune.mjs --apply`. Эту команду гард не судит: записи стареют по календарю, и шаг срока краснеет без правки в ветке. Сверяется вся команда, а не вхождение
- **A refusal by an external limiter removes the way, not the task.** — **Не исполняется.** Отказ приходит от среды исполнения, а не от гарда дерева: его текста не видит ни одна проверка, и способ, названный соседним гардом, машине с ним не связать. Держит это статья и слово владельцу о том, что осталось.
- **The plan guard is the lower bound of the requirement, not its limit.** — `.claude/hooks/task-flow-guard.sh:plan` — гард судит пути кода приложения; требование шире его и держится памятью исполнителя
- **A request to merge is a turn of its own, and it never comes before a green run.** — `.claude/hooks/git-guard-draft-ready.sh:run_verdict` — ход не заканчивается, пока разобранная ветка стоит черновиком при зелёном прогоне на вершине PR
- **The task folder goes into the branch by a commit, not lives in one working tree.** — `.claude/hooks/task-flow-guard.sh:in_tree` — правка кода отбивается, пока папки задачи нет в `HEAD` ветки
- **The task folder is taken apart by the last commit before the PR opens, not after approval.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — открытие заявки отбивается, пока ветка везёт `docs/tasks/<ветка>`; замысел после уборки гард хода работы берёт из истории ветки — `.claude/hooks/task-flow-guard.sh:folder_archived`
- **A state line moved forward is the same declaration of intent, only machine-readable.** — Не проверяется: другого источника состояния, кроме этой строки, нет вовсе, и страж `.claude/hooks/turn-exit-guard.sh` обязан ей верить. Держит это сама статья.
- **Waiting for one part of a stage is never a stop of the stage.** — Не проверяется машиной: какая часть работы от чего зависит, машине не видно. Держат это статья правила и слово владельцу о том, что уже сделано.
- **An instruction to work by a rule is an instruction to do its steps, including those that change history.** — Не проверяется ничем: слово владельца лежит вне дерева, и связать его с тем, что исполнитель сделал дальше, нечем. Держится этой статьёй и ловушкой о строке ожидания в холодной части правила.
- **A taken task does not end a turn.** — `.claude/hooks/turn-exit-guard.sh:first_stage` — ход, объявивший записанный замысел, отбивается до второго признака; сценарии — `projects/agent-kit/tests/turn-exit-guard.test.sh`
- **A finding made mid-stage is checked against the plan's exit conditions before the first edit.** — **Не проверяется ничем.** До первой правки находки в дереве нет вовсе, а после неё гард видит правку и не знает, названа она замыслом или нет. Файлы соседней работы от файлов своей ничем не отличаются. Держится сверкой с перечнем этапов, а не признаком.
- **Done work is marked only in the progress.** — **Не проверяется ничем.** Вторую запись о сделанном — в теле коммита, в описании PR — машине не с чем сверить
- **The next task is taken from the epic plan, and the work queue list is asked only where there is no epic.** — **Не проверяется ничем.** Замысел эпика лежит в `docs/plans/`, а вызов очереди работ машине неотличим от вызова с открытым замыслом рядом. Держится порядком паттерна возвращения к работе
- **An epic is not closed by a sign confirmed by reading alone.** — **Не проверяется ничем.** Признак конца эпика — проза в его замысле; отличить прочитанное от проверенного машине нечем. Держится тем, что при закрытии эпика каждый его признак называется вслух вместе с командой либо замером
- **The tasks of an epic are created all at once, by the same turn as the epic itself.** — **Не проверяется ничем.** Сверка очереди работ судит метку эпика против замысла только по паре «карточка и замысел», а состав задач с таблицей порядка не сводит. Заведена одна из десяти или все десять, ей не видно
- **The epic plan names how the branches of its tasks stand, on a par with their order.** — **Не проверяется ничем.** Замыслы эпиков лежат в `docs/plans/`, и строки о расстановке веток у них нет. Сверка очереди работ читает состав задач, а не базу их веток. Держится статьёй; цена расстановки видна только после открытия заявок — по тому, у скольких из них встал прогон.
- **The epic plan lies where it is found without the network and after the merge.** — **Не проверяется ничем.** Каталог замыслов здесь `docs/plans/`, но что в нём лежит замысел именно этого эпика, проверить нечем
- **Closed work is reviewed by the rules, and this is a closing step, not a separate request.** — **Не проверяется ничем.** Запуск роли разбора — ход исполнителя, и следа в дереве он не оставляет; приём — команда `/skill-curator`
- **Two requirements — two guards, and one can be lifted without losing the other.** — `.claude/hooks/task-flow-draft-guard.sh:draft` — договорённость судит свой гард, папку задачи и состояние — `.claude/hooks/task-flow-guard.sh:folder_archived`; разбор вызова у них общий — `.claude/hooks/task-flow-context.sh:rt_task_flow_context`
- **The agreement is required by the edit paths, not by an appraisal of the task.** — `.claude/hooks/task-flow-context.sh:rt_tf_candidates` — судятся пути правки; обход — строка о поведении в шапке замысла
- **What needs the owner's word is taken from a list, not appraised on the spot.** — **Не проверяется.** Список стоит в настройке агента, `.claude/settings.json`, ключом решений о доступе. Исполнимого признака «оценил на месте» у машины нет: она видит вызов, а не то, чем он был решён
- **A reply to the owner's order begins with the result, not with intent or its justification.** — **Не проверяется ничем.** Ответ владельцу не читает ни один гейт: правило текстов зовётся только на `.md`, а форму реплики не судит ничто. Держится автором
- **A session does not start work by itself.** — `.claude/hooks/work-start-guard.sh:kind` — ход, правивший код приложения после реплики, просьбой не бывающей, не заканчивается. Судится форма реплики, а не смысл: пустая, одно слово, один путь; всё остальное считается просьбой
- **An instruction to work by the progress covers all its steps, including those that change history.** — **Не проверяется.** Ни один гард не спрашивает, чем именно разрешён шаг
- **A question written by a past session does not become a question to the owner.** — **Не проверяется.** Гард разговора судит завершение хода, а не происхождение вопроса
- **The owner's instruction holds until they cancel it, and a new fact against it is a line in the reply about the cost, not a new question.** — `.claude/hooks/grill-gate.sh:seen` — второй признак гарда. Судится пересечение значимых слов темы вопроса и последней реплики владельца, и только при уже бывшем вызове меню
- **An answer in the owner's message counts the same as an answer in a document.** — `.claude/hooks/grill-gate.sh:seen` — реплика владельца берётся из записи хода тем же разбором, что и первый признак
- **The owner's word about the design is a task setting, not a decision.** — **Не проверяется ничем:** прочтение слова машине не видно. Держится разбором просьбы — шесть обязательных вопросов паттерна `task-flow-start` спрашивают как раз о том, что названо словом владельца, а сверка слова с деревом стоит одного поиска по спекам и моделям.
- **A task folder is created for any work, no exceptions.** — `.claude/hooks/task-flow-guard.sh:tasks_dir` — каталог задач здесь `docs/tasks`, папка ищется по имени ветки один в один
- **The task folder is created as a draft and gets its number by a command.** — `tools/task-new.mjs:adoptDraft` — черновик по слагу переименовывается в папку по имени ветки и получает шапку замысла
- **An abandoned grill is visible.** — `tools/check-board.mjs:checkDrafts` — черновик старше недели перечисляется сверкой очереди работ
- **Work ordered in words becomes a task in the queue in the same turn.** — **Не проверяется ничем:** просьба владельца звучит репликой, а не вызовом, и признака у неё нет. Сверка очереди видит черновик папки только через неделю — это порог брошенного разбора, а работа теряется в тот же час
- **The cheap closing step goes before the costly one, and the run — after the merge.** — **Не проверяется.** Порядок шагов внутри ветки машине не виден: она читает коммиты, а не то, в каком порядке их делали. Держится порядком паттерна закрытия работы
- **The agreement merges into the domain spec by one of the last commits of the branch, before the PR opens.** — `tools/check-specs.mjs:ripe` — готовые к вливанию перечисляет `npm run check:specs`
- **The folder of a closed task is taken apart, not moved whole.** — `tools/check-board.mjs:numberFromTaskDir` — папка при закрытой задаче находится сверкой очереди работ
- **Opening the PR and lifting the draft are refused while the branch carries its task folder.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — ярус на `gh pr create`, второй рубеж на `gh pr merge`; каталог задач `docs/tasks`, главная `main`
- **A branch that removed the folder must add a record to the archive.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_folder_was_in_branch` — каталог архива здесь `docs/archive/`
- **The bypass is the line `Task-folder-skip: <причина>` in the PR or in the command itself.** — `.claude/hooks/git-guard-delivery.sh:folder_skip_re`, тело PR — `.claude/rt-kit/defaults/project.sh:rt_report_body_default`
- **A merged agreement does not lock the branch.** — `.claude/hooks/task-flow-draft-guard.sh:draft_path` — история ветки отличает влитое от незаведённого
- **The PR opens as a draft, not at the end of the work.** — Не проверяется ничем: гарды видят вызов открытия PR, но не знают, закрыты ли этапы замысла. Приём — паттерн `git-workflow-commit`
- **A word for a new notion is looked up in the tree's glossary.** — `.claude/hooks/glossary-load.sh:GLOSSARY` — словарь `docs/GLOSSARY.md`, свои разделы в `.claude/rt-kit/overrides/docs/GLOSSARY.md`
- **The review of closed work goes to the background, and the executor takes the next task.** — Не проверяется ничем: запуск роли — ход исполнителя, и машине не видно, ждал он её или работал. Приём — команда `/skill-curator`
- **The review's findings wait for the owner, and only the digest of observations leaves for the package.** — `projects/agent-kit/src/lib/proposals.ts:readProposals` — уезжает то, что лежит в `.claude/rt-kit/proposals/`, и только по вызову `agent-kit propose`
- **Building by a sample begins with reading the sample itself, not a retelling of it.** — **Не проверяется ничем.** Что заход открывал, следа в дереве не оставляет: гарды судят правку, а не чтение. Держится этой статьёй и разбором запись «2026-08-16-sample-judged-by-one-file» в приёме
- **What acts on the tree, not on the edit, lies outside the index.** — **Не проверяется ничем.** Запись лежит в `.claude/handoff/` рядом с передачей захода — каталог в `.gitignore`, и сверки его не читают. Печатает её хук `SessionStart` в `.claude/settings.local.json`, который тоже вне истории. Разрешения работать вне эпика у этого дерева нет вовсе: гарда эпика оно не завело

## Чего из закона здесь нет

- **Брошенные черновики и папки закрытых задач находятся проверкой.** — **Исполняется наполовину.** `npm run check:board` в дереве есть, но машинная учётная запись доску владельца не видит и проверка отказывает вслух. Папки пока разбираются глазами при закрытии.
- **Готовность договорённости к вливанию проверяется командой.** — **Проверять нечего.** `npm run check:specs` работает, но спеков пакетов пока ни одного.

Две другие статьи закона — состояние незаконченной работы в контексте и запрет писать код
раньше замысла — исполняются с редакции 0.4.0 пакета: он везёт `task-context-load.sh` и
`task-flow-guard.sh` сам.

## Что ещё стоит знать при чтении кода

- **`docs/plans/` старше этого правила.** Там лежат замыслы эпиков — работ, каждая из которых
  шире одной ветки; папка задачи их не отменяет и не дублирует — она про одну ветку. Туда же
  ложится замысел нового эпика: карточка с меткой `epic` в очереди работ говорит, что он есть, а
  порядок задач держит эта запись.
- **Номер задачи приходит из GitHub, а не из имени папки.** Пока задача не заведена, папка
  зовётся `docs/tasks/_draft-<slug>/` и в историю не едет.

## Чем это проверяется

- `.claude/hooks/task-flow-guard.sh` — правку кода без `plan.md` отбивает, один раз на ветку за
  сессию.
- `.claude/hooks/task-context-load.sh` — состояние незаконченной работы уезжает в контекст на
  запуске сессии.
- `.claude/hooks/git-guard-draft-ready.sh` — ход не заканчивается, пока готовая работа стоит
  черновиком. Гард этого дерева, не пакетный. Общие условия: PR текущей ветки открыт черновиком
  и прогон **на вершине PR** завершён успехом. Дальше оснований для отказа два — папки задачи в
  ветке нет, значит остался один вызов `gh pr ready`; папка лежит, но ход работы говорит, что
  этапы закрыты, значит работа стоит на уборке, и отбивка называет её порядок. Этапы открыты —
  гард молчит: черновик при идущей работе законен. Ответ хостинга кэшируется на минуту.
- `npm run check:hooks` — сценарии гарда, десять исходов, без сети: помощник хостинга подставлен,
  каждый сценарий поднимает свой временный репозиторий. Стоит в наборе гейта пуша и шагом
  конвейера. Натравливается на нарочно сломанную копию гарда через `RT_GUARD_PATH`: набор,
  который не краснеет на поломке, не проверяет ничего.
- `npm run check:board` — брошенные черновики и папки закрытых задач; сейчас отказывает вслух,
  потому что доска машинной учётной записи не видна.
- Глазами при закрытии работы: папка задачи разобрана, `progress.md` дописан, договорённость
  влита в спек пакета.
- `pnpm run agent-kit:check` — правило разложено и его компаньон заполнен.
