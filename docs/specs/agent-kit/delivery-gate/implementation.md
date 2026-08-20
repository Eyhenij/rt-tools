# Гарды поставки и гейт пуша — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило                                                                           | Где исполняется                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Главная ветка влита в ветку задачи до открытия PR.                                | `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`     |
| Открытие PR отбивается, пока главная ветка не влита.                              | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:behind`            |
| Несошедшиеся условия поставки называются одним отказом.                           | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:deny_faults`       |
| Каждое несошедшееся условие названо вместе с тем, чем оно снимается.              | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:fault`             |
| Условие, известное в начале работы, спрашивается в начале.                        | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:branch_arg`        |
| Судится то основание, которое названо командой, а не вершина рабочей копии.       | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:base_ref`          |
| Свежесть локальной ссылки на главную ветку спрашивается и при заведении ветки.    | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:remote_head`       |
| Ветка без номера задачи условий поставки не получает.                             | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:branch_arg`        |
| Гейт пуша зовёт то, что дерево разложило.                                         | `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`    |
| Подпись машинного коммита судится до того, как коммит уедет.                      | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:strangers`         |
| Машинный коммит опознаётся по заявке, а не по почте.                              | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:bot_login`         |
| Почта машинной записи сверяется целым значением.                                  | `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`           |
| Судится вклад ветки, а не вся история.                                            | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:main_branch`       |
| Подпись читается на машине, без сети.                                             | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:strangers`         |
| Отказ по подписи называет коммит поимённо и обе почты.                            | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:strangers`         |
| Дерево, не назвавшее почты машинной записи, требования не получает.               | `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`           |
| Личность машинной записи подтверждается ответом хостинга, а не узнаванием строки. | `projects/agent-kit/assets/rules/git-workflow.github.md:git-workflow`     |
| Токен машинной записи очередь работ не требует.                                   | `projects/agent-kit/assets/checks/board.github.mjs:botToken`              |
| Подпись коммита и работа с очередью — разные свойства машинной записи.            | `projects/agent-kit/assets/defaults/project.sh:RT_COMMIT_EMAIL`           |
| Набор гейта пуша не бывает уже набора конвейера.                                  | `tools/check-push-gate.mjs:pipelineSteps`                                 |
| Полнота держится объявленным списком, а не разбором файла конвейера.              | `tools/check-push-gate.mjs:pushGate`                                      |
| Исключение объявляется с причиной и рядом с набором.                              | `tools/check-push-gate.mjs:pipelineSteps`                                 |
| Дерево без файла конвейера сверку не получает.                                    | `tools/check-push-gate.mjs:pipelineSteps`                                 |
| Проверка полноты сама стоит в наборе гейта.                                       | `.claude/rt-kit/project.sh:rt_push_checks`                                |
| Переключение ветки в той же команде отбивает пуш целиком.                         | `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:checkout`        |
| Тяжёлый шаг набора отбирается по составу правки.                                  | `projects/agent-kit/assets/defaults/project.sh:rt_push_docs_only_default` |
| Отложенная правка пушем не считается.                                             | `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:probe`           |
