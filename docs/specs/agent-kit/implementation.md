# agent-kit — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                                                    | Где исполняется                                                          |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Пакет проверяет то, что везёт, а не только то, чем везёт.                                                  | `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`                  |
| Ресурс, оставшийся без своего вида, — отказ раскладки, а не молчание.                                      | `projects/agent-kit/src/lib/catalog.ts:variantGaps`                      |
| Текст правила не называет путей, доменов и портов дерева, которому он не принадлежит.                      | `projects/agent-kit/tests/texts.test.sh:found_domains`                   |
| Раскладка из устаревшей сборки не выдаёт себя за свежую.                                                   | `projects/agent-kit/src/lib/freshness.ts:staleBuild`                     |
| Разложенное сверяется по содержимому, а не по номеру редакции.                                             | `projects/agent-kit/src/lib/plan.ts:planFile`                            |
| Переход чужого файла в управление пакетом делается командой, а не руками.                                  | `projects/agent-kit/src/lib/commands.ts:adopt`                           |
| Разложенное, которому нужна запись в чужой настройке, доезжает до неё.                                     | `projects/agent-kit/src/lib/hooks-map.ts:unboundHooks`                   |
| Надстройка настроек проверок сливается по вложенным ключам.                                                | `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:mergeDeep`    |
| Пакет не знает раскладки чужого дерева.                                                                    | `projects/agent-kit/assets/checks/check-lib-layers.mjs:LIBS_ROOT`        |
| Первая установка не требует писать прозу руками.                                                           | `projects/agent-kit/src/lib/companion.ts:draftOf`                        |
| Папка задачи не уезжает в главную ветку.                                                                   | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch` |
| Проверяется то, что уедет в главную ветку, а не то, что лежит на машине.                                   | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch` |
| Ветка, разобравшая папку, добавляет запись в каталог архива.                                               | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:gained`           |
| На открытии PR папка ещё нужна, поэтому там только напоминание.                                            | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:hint`             |
| Обход требования пишут с причиной, и он читается без сети.                                                 | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_skip_re`   |
| Обход снимает отказ, но не убирает строку из сверки.                                                       | `projects/agent-kit/assets/checks/check-board.github.mjs:taskDirs`       |
| Папку ищут по имени ветки целиком, вместе с косой.                                                         | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch` |
| Сверка очереди работ видит папку задачи и во вложенном каталоге.                                           | `projects/agent-kit/assets/checks/board.github.mjs:taskDirs`             |
| Дерево, не задавшее каталог задач, требования не получает.                                                 | `projects/agent-kit/assets/defaults/project.sh:RT_TASKS_DIR`             |
| Ход, в котором владельцу задан вопрос, не заканчивается, пока за этот же ход не читались законы и правила. | `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`                  |
| Чтением считается любой из трёх путей, а не только загрузка правила.                                       | `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`                  |
| Повторный заход по тому же ходу не судится.                                                                | `projects/agent-kit/assets/hooks/grill-gate.sh:active`                   |
| Гард разговора пропускает работу при любой поломке.                                                        | `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`               |
| Поддомен сверяется наравне с доменом.                                                                      | `projects/agent-kit/assets/checks/check-specs.mjs:collectSpecDirs`       |
| Предложенный закон правила не требует.                                                                     | `projects/agent-kit/assets/checks/check-specs.mjs:isProposedLaw`         |
| Влитая договорённость ветку не запирает.                                                                   | `projects/agent-kit/assets/hooks/task-flow-guard.sh:draft_path`          |
| Префикс сценариев занят одним спеком по всему дереву.                                                      | `projects/agent-kit/assets/checks/check-specs.mjs:prefixOwners`          |
| Пакет везёт словарь как ресурс, а не только хук, который его читает.                                       | `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`                    |
| Пакет везёт общую часть словаря, дерево дописывает предметную.                                             | `projects/agent-kit/src/lib/sections.ts:mergeDocuments`                  |
| Гард окна напоминает раньше, чем отбивает.                                                                 | `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`          |
| Напоминание повторяется по ступеням, а не на каждом действии.                                              | `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`              |
| После порога остановки проходят запись хода работы, передача и команды поставки.                           | `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`           |
| Размер окна берётся из настройки дерева, а не из записи захода.                                            | `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`         |
| Гард окна пропускает работу при любой поломке.                                                             | `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`        |
| Один файл гарда вправе объявить несколько событий.                                                         | `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`                     |
| Правило и паттерн судятся как спек, а не как файл агента.                                                  | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`       |
| Конфиг линтера требует правило под собой.                                                                  | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`       |
| Проверка повторов требует правило, чьи признаки исполняет, и только его.                                   | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`       |
| Голое имя и каталог судятся наравне с полным путём.                                                        | `projects/agent-kit/assets/checks/check-doc-paths.mjs:existsInTree`      |
| Дерево для сверки путей берётся у системы контроля версий, а не обходом каталогов.                         | `projects/agent-kit/assets/checks/check-doc-paths.mjs:treeOfRepo`        |
| Папки задач выведены из сверки путей, как архив.                                                           | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isSkipped`         |
| Переносимый текст из сверки адресов выведен.                                                               | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isPortable`        |
| Полнота указателя каталога сверяется обеими сторонами.                                                     | `projects/agent-kit/assets/checks/check-doc-paths.mjs:checkIndex`        |
| Расхождение указателя печатается своим списком со своим доводом.                                           | `projects/agent-kit/assets/checks/check-doc-paths.mjs:reportIndex`       |
| Привязками считаются строки одной таблицы компаньона, а не всякая строка, похожая на строку таблицы.       | `projects/agent-kit/assets/checks/check-specs.mjs:rowsOfMap`             |
| Компаньон правила без раздела привязок — отказ, а не молчание.                                             | `projects/agent-kit/assets/checks/check-specs.mjs:rowsOfMap`             |

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
