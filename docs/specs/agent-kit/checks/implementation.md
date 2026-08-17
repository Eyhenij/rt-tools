# Проверки дерева и гейт пуша — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило | Где исполняется |
| ------- | --------------- |
| Каталог чужого пакета ищется разрешением модуля, а не путём в каталоге зависимостей.                         | `projects/agent-kit/assets/checks/check-dupes.mjs:resolveExternalDir`         |
| Отсутствие чужого пакета проверку не роняет.                                                                 | `projects/agent-kit/assets/checks/check-dupes.mjs:holdersOf`                  |
| Главная ветка влита в ветку задачи до открытия PR.                                                           | `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`         |
| Открытие PR отбивается, пока главная ветка не влита.                                                         | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:behind`                |
| Гейт пуша зовёт то, что дерево разложило.                                                                    | `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`        |
| Предел длины объявлен одним числом на все роды файлов.                                                       | `projects/agent-kit/assets/checks/check-file-size.mjs:LIMIT`                  |
| Накопленное до объявления предела перечислено поимённо.                                                      | `projects/agent-kit/assets/checks/check-file-size.mjs:readKnown`              |
| Принятое и долг в перечне различаются.                                                                       | `projects/agent-kit/assets/checks/check-file-size.mjs:known`                  |
| Данные из счёта длины выведены.                                                                              | `projects/agent-kit/assets/checks/check-file-size.mjs:JUDGED`                 |
| Описание прошлого и папка задачи из счёта выведены.                                                          | `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`       |
| Сгенерированное выведено каталогом, а не именами.                                                            | `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`       |
| Длина считается тем же способом, каким её считает линтер.                                                    | `projects/agent-kit/assets/checks/check-file-size.mjs:lineCount`              |
| Признак единообразия живёт данными, а не кодом проверки.                                                     | `projects/agent-kit/assets/checks/signals.mjs:loadSignals`                    |
| Набор признаков режется по пакетам rt-tools.                                                                 | `projects/agent-kit/assets/checks/signals.mjs:BUNDLES_DIR`                    |
| Дерево получает признаки тех пакетов, которые назвало.                                                       | `projects/agent-kit/assets/checks/signals.mjs:readBundle`                     |
| Дерево дописывает признаки, а не правит чужие.                                                               | `projects/agent-kit/assets/checks/signals.mjs:byKey`                          |
| Признак называет свою область.                                                                               | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:scope`                  |
| Пустое поле признака не съезжает в соседнее.                                                                 | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:cancel`                 |
| Гард, не получивший ни одного признака, говорит об этом.                                                     | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:signals_seen`           |
| Гард на правке и сплошная проверка читают у признака одни и те же поля.                                      | `projects/agent-kit/assets/hooks/reuse-first-guard.sh:rt_backend_roots`       |
| Подпись машинного коммита судится до того, как коммит уедет.                                                 | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:strangers`             |
| Машинный коммит опознаётся по заявке, а не по почте.                                                         | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:bot_login`             |
| Почта машинной записи сверяется целым значением.                                                             | `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`               |
| Судится вклад ветки, а не вся история.                                                                       | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:main_branch`           |
| Подпись читается на машине, без сети.                                                                        | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:strangers`             |
| Отказ по подписи называет коммит поимённо и обе почты.                                                       | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:strangers`             |
| Дерево, не назвавшее почты машинной записи, требования не получает.                                          | `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`               |
| Личность машинной записи подтверждается ответом хостинга, а не узнаванием строки.                            | `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`         |
| Токен машинной записи очередь работ не требует.                                                              | `projects/agent-kit/assets/checks/board.github.mjs:botToken`                  |
| Подпись коммита и работа с очередью — разные свойства машинной записи.                                       | `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`               |
| Набор гейта пуша не бывает уже набора конвейера.                                                             | `tools/check-push-gate.mjs:pipelineSteps`                                     |
| Полнота держится объявленным списком, а не разбором файла конвейера.                                         | `tools/check-push-gate.mjs:pushGate`                                          |
| Исключение объявляется с причиной и рядом с набором.                                                         | `tools/check-push-gate.mjs:pipelineSteps`                                     |
| Дерево без файла конвейера сверку не получает.                                                               | `tools/check-push-gate.mjs:pipelineSteps`                                     |
| Проверка полноты сама стоит в наборе гейта.                                                                  | `.claude/rt-kit/project.sh:rt_push_checks`                                    |
