# agent-kit — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                                                      | Где исполняется                                                               |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Пакет проверяет то, что везёт, а не только то, чем везёт.                                                    | `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`                       |
| Ресурс, оставшийся без своего вида, — отказ раскладки, а не молчание.                                        | `projects/agent-kit/src/lib/catalog.ts:variantGaps`                           |
| Текст правила не называет путей, доменов и портов дерева, которому он не принадлежит.                        | `projects/agent-kit/tests/texts.test.sh:found_domains`                        |
| Раскладка из устаревшей сборки не выдаёт себя за свежую.                                                     | `projects/agent-kit/src/lib/freshness.ts:staleBuild`                          |
| Разложенное сверяется по содержимому, а не по номеру редакции.                                               | `projects/agent-kit/src/lib/plan.ts:planFile`                                 |
| Переход чужого файла в управление пакетом делается командой, а не руками.                                    | `projects/agent-kit/src/lib/commands.ts:adopt`                                |
| Разложенное, которому нужна запись в чужой настройке, доезжает до неё.                                       | `projects/agent-kit/src/lib/hooks-map.ts:unboundHooks`                        |
| Надстройка настроек проверок сливается по вложенным ключам.                                                  | `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:mergeDeep`         |
| Пакет не знает раскладки чужого дерева.                                                                      | `projects/agent-kit/assets/checks/check-lib-layers.mjs:LIBS_ROOT`             |
| Первая установка не требует писать прозу руками.                                                             | `projects/agent-kit/src/lib/companion.ts:draftOf`                             |
| Папка задачи не уезжает в главную ветку.                                                                     | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch`      |
| Проверяется то, что уедет в главную ветку, а не то, что лежит на машине.                                     | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch`      |
| Ветка, разобравшая папку, добавляет запись в каталог архива.                                                 | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:gained`                |
| На открытии PR папка ещё нужна, поэтому там только напоминание.                                              | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:hint`                  |
| Обход требования пишут с причиной, и он читается без сети.                                                   | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_skip_re`        |
| Обход снимает отказ, но не убирает строку из сверки.                                                         | `projects/agent-kit/assets/checks/check-board.github.mjs:taskDirs`            |
| Папку ищут по имени ветки целиком, вместе с косой.                                                           | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch`      |
| Сверка очереди работ видит папку задачи и во вложенном каталоге.                                             | `projects/agent-kit/assets/checks/board.github.mjs:taskDirs`                  |
| Дерево, не задавшее каталог задач, требования не получает.                                                   | `projects/agent-kit/assets/defaults/project.sh:RT_TASKS_DIR`                  |
| Ход, в котором владельцу задан вопрос, не заканчивается, пока за этот же ход не читались законы и правила.   | `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`                       |
| Чтением считается любой из трёх путей, а не только загрузка правила.                                         | `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`                       |
| Повторный заход по тому же ходу не судится.                                                                  | `projects/agent-kit/assets/hooks/grill-gate.sh:active`                        |
| Гард разговора пропускает работу при любой поломке.                                                          | `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`                    |
| Поддомен сверяется наравне с доменом.                                                                        | `projects/agent-kit/assets/checks/check-specs.mjs:collectSpecDirs`            |
| Предложенный закон правила не требует.                                                                       | `projects/agent-kit/assets/checks/check-specs.mjs:isProposedLaw`              |
| Влитая договорённость ветку не запирает.                                                                     | `projects/agent-kit/assets/hooks/task-flow-guard.sh:draft_path`               |
| Префикс сценариев занят одним спеком по всему дереву.                                                        | `projects/agent-kit/assets/checks/check-specs.mjs:prefixOwners`               |
| Пакет везёт словарь как ресурс, а не только хук, который его читает.                                         | `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`                         |
| Пакет везёт общую часть словаря, дерево дописывает предметную.                                               | `projects/agent-kit/src/lib/sections.ts:mergeDocuments`                       |
| Гард окна напоминает раньше, чем отбивает.                                                                   | `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`               |
| Напоминание повторяется по ступеням, а не на каждом действии.                                                | `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`                   |
| После порога остановки проходят запись хода работы, передача и команды поставки.                             | `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`                |
| Размер окна берётся из настройки дерева, а не из записи захода.                                              | `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`              |
| Гард окна пропускает работу при любой поломке.                                                               | `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`             |
| Один файл гарда вправе объявить несколько событий.                                                           | `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`                          |
| Правило и паттерн судятся как спек, а не как файл агента.                                                    | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`            |
| Конфиг линтера требует правило под собой.                                                                    | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`            |
| Проверка повторов требует правило, чьи признаки исполняет, и только его.                                     | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`            |
| Голое имя и каталог судятся наравне с полным путём.                                                          | `projects/agent-kit/assets/checks/check-doc-paths.mjs:existsInTree`           |
| Дерево для сверки путей берётся у системы контроля версий, а не обходом каталогов.                           | `projects/agent-kit/assets/checks/check-doc-paths.mjs:treeOfRepo`             |
| Папки задач выведены из сверки путей, как архив.                                                             | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isSkipped`              |
| Переносимый текст из сверки адресов выведен.                                                                 | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isPortable`             |
| Полнота указателя каталога сверяется обеими сторонами.                                                       | `projects/agent-kit/assets/checks/check-doc-paths.mjs:checkIndex`             |
| Расхождение указателя печатается своим списком со своим доводом.                                             | `projects/agent-kit/assets/checks/check-doc-paths.mjs:reportIndex`            |
| Привязками считаются строки одной таблицы компаньона, а не всякая строка, похожая на строку таблицы.         | `projects/agent-kit/assets/checks/check-specs.mjs:rowsOfMap`                  |
| Компаньон правила без раздела привязок — отказ, а не молчание.                                               | `projects/agent-kit/assets/checks/check-specs.mjs:rowsOfMap`                  |
| Заход закрывается одной командой.                                                                            | `projects/agent-kit/assets/commands/next-session.md:ARGUMENTS`                |
| Команда закрытия захода сперва узнаёт, ведётся ли работа по правилу.                                         | `projects/agent-kit/assets/commands/next-session.md:rt_task_branch_ok`        |
| У работы по правилу с влитым отчётом дерево переходит на главную ветку и подтягивает удалённую.              | `projects/agent-kit/assets/commands/next-session.md:switch`                   |
| Во всех прочих случаях главная ветка вливается в текущую.                                                    | `projects/agent-kit/assets/commands/next-session.md:merge`                    |
| Незакоммиченная правка останавливает закрытие захода до первого действия.                                    | `projects/agent-kit/assets/commands/next-session.md:status`                   |
| Снимаются только влитые локальные ветки.                                                                     | `projects/agent-kit/assets/commands/next-session.md:merged`                   |
| Мёртвые отслеживания снимаются тем же вызовом.                                                               | `projects/agent-kit/assets/commands/next-session.md:prune`                    |
| Передача пишется последней и кладётся вне дерева.                                                            | `projects/agent-kit/assets/commands/next-session.md:RT_HANDOFF_DIR`           |
| Имя главной ветки и каталог передачи команда берёт из профиля дерева.                                        | `projects/agent-kit/assets/defaults/project.sh:RT_HANDOFF_DIR`                |
| Закрытие захода не трогает поставку.                                                                         | `projects/agent-kit/assets/commands/next-session.md:ARGUMENTS`                |
| Номер сценария из одной цифры сверка видит наравне с двумя и тремя.                                          | `projects/agent-kit/assets/checks/check-specs.mjs:SCENARIO_HEADING`           |
| Шаги работы пронумерованы сплошь, и весь их список лежит в правиле ведения работы.                           | `projects/agent-kit/assets/rules/task-flow.md:task-flow`                      |
| Номер сценария выдаётся один раз и повторно не используется.                                                 | `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`                  |
| Сценарий и заголовок его теста правятся одним изменением.                                                    | `projects/agent-kit/assets/patterns/spec-driven-domain.md:spec-driven-domain` |
| Правило об оформлении документов держит раздел под скилы дерева.                                             | `projects/agent-kit/assets/rules/doc-style.md:doc-style`                      |
| Требование ресурса названо в самом ресурсе, а не выводится чтением.                                          | `projects/agent-kit/src/lib/catalog.ts:requiresOf`                            |
| Разорванная связь — предупреждение, а не отказ.                                                              | `projects/agent-kit/src/lib/catalog.ts:brokenLinks`                           |
| Разбор состояния называет невыбранное поимённо, а не числом.                                                 | `projects/agent-kit/src/lib/commands.ts:doctor`                               |
| Хук, которому не хватает функции профиля, говорит об этом вместо молчания.                                   | `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`                   |
| Сообщение о нехватке не превращает хук в отказ.                                                              | `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`                   |
| Разбор состояния перечисляет функции профиля, которых ждут разложенные хуки, и те из них, что не определены. | `projects/agent-kit/src/lib/commands.ts:profileLines`                         |
| Ресурс пакета не описывает состояние дерева как факт.                                                        | `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`                  |
| Признак кода приложения судится относительно корня дерева.                                                   | `projects/agent-kit/assets/defaults/project.sh:rt_is_app_code_default`        |
| Ход, в котором исполнитель признал промах, не закрывается, пока записи о происшествии нет.                   | `projects/agent-kit/assets/hooks/postmortem-guard.sh:postmortem-guard`        |
| Ход с вопросом владельцу проверяется на инструменте вопроса, а не на завершении хода.                        | `projects/agent-kit/assets/hooks/grill-gate.sh:grill-gate`                    |
| Заведение рабочего дерева грузит правило поставки.                                                           | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`            |
| Наблюдение записывается в дерево, а не во временный каталог.                                                 | `projects/agent-kit/src/lib/observations.ts:OBSERVATIONS_DIR`                 |
| Наблюдение не называет из дерева ничего, кроме рода файла.                                                   | `projects/agent-kit/assets/hooks/observe.sh:rt_observe_clean`                 |
| Запись наблюдений выключается настройкой дерева.                                                             | `projects/agent-kit/assets/hooks/observe.sh:rt_observe_dir`                   |
| Гард, не сумевший записать наблюдение, пропускает действие.                                                  | `projects/agent-kit/assets/hooks/observe.sh:rt_note`                          |
| Сводка называет и то, чем ни разу не пользовались.                                                           | `projects/agent-kit/src/lib/observations.ts:summarize`                        |
| Сводка отвечает за отрезок дней, а не за всё время.                                                          | `projects/agent-kit/src/lib/observations.ts:DEFAULT_DAYS`                     |
| Наблюдения старше срока хранения снимаются сводкой.                                                          | `projects/agent-kit/src/lib/observations.ts:readObservations`                 |
| Предложение выгружается файлом с адресом в заголовке.                                                        | `projects/agent-kit/src/lib/proposals.ts:parseProposals`                      |
| Роль разбора закрытой задачи файлов не пишет.                                                                | `projects/agent-kit/assets/commands/skill-curator.md:proposals`               |
| Наружу уезжают только предложения с адресом «пакет».                                                         | `projects/agent-kit/src/lib/commands.ts:propose`                              |
| Отправка отказывает, если в тексте предложения найден адрес дерева.                                          | `projects/agent-kit/src/lib/proposals.ts:leaksIn`                             |
| Отправленное предложение помечается ссылкой и второй раз не уезжает.                                         | `projects/agent-kit/src/lib/proposals.ts:markSent`                            |
| Адрес репозитория пакета читается из его манифеста.                                                          | `projects/agent-kit/src/lib/submit.ts:repositoryOf`                           |
| Наружу не уходит ничего, чего не отправил человек командой.                                                  | `projects/agent-kit/src/lib/submit.ts:ghIssue`                                |
| Сведение отделяет пришедшее из нескольких деревьев от пришедшего из одного.                                  | `projects/agent-kit/assets/commands/agent-kit-digest.md:overrides`            |
| Выпуск версии остаётся отдельным решением владельца.                                                         | `projects/agent-kit/assets/commands/agent-kit-digest.md:ARGUMENTS`            |
| Главная ветка влита в ветку задачи до открытия отчёта.                                                       | `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`         |
| Открытие отчёта отбивается, пока главная ветка не влита.                                                     | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:behind`                |
| Пакет не пишет в файлы, принадлежащие дереву.                                                                | `projects/agent-kit/README.md:observations`                                   |
| Слои поверх доменного правила объявляются своим файлом, а не строками в гейте.                               | `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_add`           |
| Слой требует правило дополнительно, а не вместо доменного.                                                   | `projects/agent-kit/assets/hooks/skill-gate.sh:want`                          |
| Признак, невидимый по пути, судится по тексту правки.                                                        | `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_payload`       |
| Слой, которому нечем прочитать текст правки, отпускает действие.                                             | `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_is_spec`       |
| Файл слоёв гейт зовёт в своей оболочке, а не отдельным процессом.                                            | `projects/agent-kit/assets/hooks/skill-gate.sh:rt_hooks_dir`                  |
| Карта гейта считает командой вызов, а не упоминание.                                                         | `projects/agent-kit/assets/defaults/gate-map.sh:rt_gate_invokes`              |
| Гейт пуша зовёт то, что дерево разложило.                                                                    | `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`        |
| Предел длины объявлен одним числом на все роды файлов.                                                       | `projects/agent-kit/assets/checks/check-file-size.mjs:LIMIT`                  |
| Накопленное до объявления предела перечислено поимённо.                                                      | `projects/agent-kit/assets/checks/check-file-size.mjs:readKnown`              |
| Принятое и долг в перечне различаются.                                                                       | `projects/agent-kit/assets/checks/check-file-size.mjs:known`                  |
| Данные из счёта длины выведены.                                                                              | `projects/agent-kit/assets/checks/check-file-size.mjs:JUDGED`                 |
| Описание прошлого и папка задачи из счёта выведены.                                                          | `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`       |
| Сгенерированное выведено каталогом, а не именами.                                                            | `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`       |
| Длина считается тем же способом, каким её считает линтер.                                                    | `projects/agent-kit/assets/checks/check-file-size.mjs:lineCount`              |
| Отказ от родителя снимает потомков, а лишняя строка отказа объявляется предупреждением.                      | `projects/agent-kit/src/lib/catalog.ts:cascadeCuts`                           |
| Закон, не попавший в выбор, отвергнут наравне с названным в отказе.                                          | `projects/agent-kit/src/lib/catalog.ts:isChosen`                              |
| Каскад идёт сверху вниз и только.                                                                            | `projects/agent-kit/src/lib/catalog.ts:cascadeCuts`                           |
| Связь берётся из вступления самих ресурсов.                                                                  | `projects/agent-kit/src/lib/catalog.ts:frontMatterOf`                         |
| Снятое каскадом называется вместе с родителем.                                                               | `projects/agent-kit/src/lib/commands.ts:doctor`                               |
| Пакет везёт закон, верный любому дереву своего класса.                                                       | `projects/agent-kit/src/lib/retired.ts:RETIRED`                               |
| Отказ дерева от предметного закона — одна строка.                                                            | `projects/agent-kit/src/lib/catalog.ts:chosenEntries`                         |
| Ресурс, ушедший из пакета, уходит вместе с потомками.                                                        | `projects/agent-kit/src/lib/integrity.ts:brokenLinks`                         |
| Пакет помнит имена, которые из него ушли.                                                                    | `projects/agent-kit/src/lib/sync.ts:retiredOf`                                |
| Снятое каскадом остаётся на диске и называется отдельно от брошенного.                                       | `projects/agent-kit/src/lib/sync.ts:leftOnDisk`                               |
| Короткое имя из вступления разрешается по последнему звену имени внутри своего рода.                         | `projects/agent-kit/src/lib/catalog.ts:shortNameOf`                           |
| Два ресурса одного рода с одинаковым последним звеном имени — отказ набора.                                  | `projects/agent-kit/src/lib/integrity.ts:ambiguousNames`                      |
| Родитель с несколькими видами отвергнут, только когда не выбран ни один его вид.                             | `projects/agent-kit/src/lib/catalog.ts:cascadeCuts`                           |
| Снятый внук называется обоими: ближайшим родителем и отвергнутым корнем.                                     | `projects/agent-kit/src/lib/catalog.ts:ICascadeCut`                           |
| Выбор, который после каскада ничего не берёт, называется вслух.                                              | `projects/agent-kit/src/lib/catalog.ts:namedButCut`                           |
| Родителя нет в каталоге — каскад молчит.                                                                     | `projects/agent-kit/src/lib/catalog.ts:cascadeCuts`                           |
| Связь, порванную самим каскадом, предупреждением не считают.                                                 | `projects/agent-kit/src/lib/catalog.ts:brokenLinks`                           |
| Предупреждение раскладки печатается на любом её исходе.                                                      | `projects/agent-kit/src/lib/commands.ts:warnings`                             |
| Признак единообразия живёт данными, а не кодом проверки.                                                     | `projects/agent-kit/assets/checks/signals.mjs:loadSignals`                    |
| Набор признаков режется по пакетам rt-tools.                                                                 | `projects/agent-kit/assets/checks/signals.mjs:BUNDLES_DIR`                    |
| Дерево получает признаки тех пакетов, которые назвало.                                                       | `projects/agent-kit/assets/checks/signals.mjs:readBundle`                     |
| Дерево дописывает признаки, а не правит чужие.                                                               | `projects/agent-kit/assets/checks/signals.mjs:byKey`                          |
| Признак называет свою область.                                                                               | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:scope`                  |
| Пустое поле признака не съезжает в соседнее.                                                                 | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:cancel`                 |
| Гард, не получивший ни одного признака, говорит об этом.                                                     | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:signals_seen`           |
| Заведение задачи кончается ответом очереди работ, а не выводом команды.                                      | `projects/agent-kit/assets/checks/task-new.github.mjs:describeTaskState`      |
| Задача, которой нет в очереди работ, кончает команду заведения ненулевым кодом.                              | `projects/agent-kit/assets/checks/board.github.mjs:describeTaskState`         |
| Задача без исполнителя названа отдельной строкой.                                                            | `projects/agent-kit/assets/checks/board.github.mjs:assignees`                 |
| Неспрошенная очередь работ подтверждением не является.                                                       | `projects/agent-kit/assets/checks/task-new.github.mjs:OfflineError`           |
| Ответ очереди складывается в строки чистой функцией.                                                         | `projects/agent-kit/assets/checks/board.github.mjs:describeTaskState`         |
| Раскладка называет добавленный долг в тот же момент, когда его добавила.                                     | `projects/agent-kit/src/lib/commands.ts:debtLines`                            |
| Статьи считаются по компаньону дерева, а не по черновику пакета.                                             | `projects/agent-kit/src/lib/companion.ts:unaddressedOf`                       |
| Счёт добавленного долга складывается чистой функцией.                                                        | `projects/agent-kit/src/lib/companion.ts:debtLine`                            |

## Что ещё стоит знать при чтении кода

- **Сверка со своими исходниками возможна только из точки входа.** Там пакет знает, где лежит
  сам; библиотечные модули работают с тем каталогом ресурсов, который им дали, и о
  существовании исходников не знают вовсе.
- **Событие и образец вызова гард несёт сам** — строкой `# rt-hook:` во второй строке файла.
  Карта, выписанная отдельным списком, разошлась бы с набором гардов на первом же добавленном,
  и заметить это было бы нечем: гард просто не звался бы.
- **Наборы сценариев на исполняемые ресурсы написаны на том же языке, что и ресурсы.** Иначе их
  пришлось бы переписывать на каждую правку гарда; обёртка на Jest только зовёт их и переносит
  вывод упавшего в отказ.

## Чем это проверяется

- `nx run-many -t lint test build --projects=agent-kit` — спеки механизма раскладки и, через
  обёртку, все восемь наборов сценариев по исполняемым ресурсам.
- `bash projects/agent-kit/tests/run.sh` — те же наборы отдельно, с `VERBOSE=1` по сценариям.
- Установка с нуля в одноразовое дерево: `init --all --host <чужой вид>`, `sync`, `doctor`.
  Сводный признак прогоняется рукой — заводить чистое дерево прогоном значило бы проверять
  собственную фикстуру.
- `bash projects/agent-kit/tests/observe.test.sh` — запись наблюдений: что попадает в строку, что
  из неё вычищено и как выключается запись.
