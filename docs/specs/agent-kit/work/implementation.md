# Ведение работы командами — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило                                                                                    | Где исполняется                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Папка задачи не уезжает в главную ветку.                                                   | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch` |
| Проверяется то, что уедет в главную ветку, а не то, что лежит на машине.                   | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch` |
| Ветка, разобравшая папку, добавляет запись в каталог архива.                               | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:gained`           |
| На открытии PR папка ещё нужна, поэтому там только напоминание.                            | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:hint`             |
| Обход требования пишут с причиной, и он читается без сети.                                 | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_skip_re`   |
| Открытый PR, чья ветка везёт папку своей задачи, — расхождение сверки.                     | `projects/agent-kit/assets/checks/check-board.github.mjs:folderInBranch` |
| Строка обхода начинает строку и подстановки не принимает.                                  | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_skip_re`   |
| Обход снимает отказ, но не убирает строку из сверки.                                       | `projects/agent-kit/assets/checks/check-board.github.mjs:taskDirs`       |
| Папку ищут по имени ветки целиком, вместе с косой.                                         | `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_in_branch` |
| Сверка очереди работ видит папку задачи и во вложенном каталоге.                           | `projects/agent-kit/assets/checks/board.github.mjs:taskDirs`             |
| Дерево, не задавшее каталог задач, требования не получает.                                 | `projects/agent-kit/assets/defaults/project.sh:RT_TASKS_DIR`             |
| Заход закрывается одной командой.                                                          | `projects/agent-kit/assets/commands/next-session.md:ARGUMENTS`           |
| Команда закрытия захода сперва узнаёт, ведётся ли работа по правилу.                       | `projects/agent-kit/assets/commands/next-session.md:rt_task_branch_ok`   |
| У работы по правилу с влитым PR дерево переходит на главную ветку и подтягивает удалённую. | `projects/agent-kit/assets/commands/next-session.md:switch`              |
| Во всех прочих случаях главная ветка вливается в текущую.                                  | `projects/agent-kit/assets/commands/next-session.md:merge`               |
| Незакоммиченная правка останавливает закрытие захода до первого действия.                  | `projects/agent-kit/assets/commands/next-session.md:status`              |
| Снимаются только влитые локальные ветки.                                                   | `projects/agent-kit/assets/commands/next-session.md:merged`              |
| Мёртвые отслеживания снимаются тем же вызовом.                                             | `projects/agent-kit/assets/commands/next-session.md:prune`               |
| Передача пишется последней и кладётся вне дерева.                                          | `projects/agent-kit/assets/commands/next-session.md:RT_HANDOFF_DIR`      |
| Имя главной ветки и каталог передачи команда берёт из профиля дерева.                      | `projects/agent-kit/assets/defaults/project.sh:RT_HANDOFF_DIR`           |
| Закрытие захода не трогает поставку.                                                       | `projects/agent-kit/assets/commands/next-session.md:ARGUMENTS`           |
| Заведение задачи кончается ответом очереди работ, а не выводом команды.                    | `projects/agent-kit/assets/checks/task-new.github.mjs:describeTaskState` |
| Задача, которой нет в очереди работ, кончает команду заведения ненулевым кодом.            | `projects/agent-kit/assets/checks/board.github.mjs:describeTaskState`    |
| Задача без исполнителя названа отдельной строкой.                                          | `projects/agent-kit/assets/checks/board.github.mjs:assignees`            |
| Неспрошенная очередь работ подтверждением не является.                                     | `projects/agent-kit/assets/checks/task-new.github.mjs:OfflineError`      |
| Ответ очереди складывается в строки чистой функцией.                                       | `projects/agent-kit/assets/checks/board.github.mjs:describeTaskState`    |
