# Привязка — сверка очереди работ

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Сверка очереди работ видит папку задачи и во вложенном каталоге.** — `projects/agent-kit/assets/checks/board.github.mjs:taskDirs`
- **Открытый PR, чья вершина не несёт прогона, — расхождение сверки.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkHeadRun`
- **Прогон спрашивается на вершине PR, а не на его ветке.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:runsOnHead`
- **Считается сам факт прогона, а не его цвет.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:total_count`
- **Свежая вершина без прогона не судится.** — `projects/agent-kit/assets/checks/check-board.github.mjs:RUN_GRACE_MINUTES`
- **Дерево без файла конвейера прогонов не спрашивает.** — `projects/agent-kit/assets/checks/check-board.github.mjs:HAS_PIPELINE`
- **Дерево, у которого прогоны не спрашивались, слышит об этом отдельной строкой.** — `projects/agent-kit/assets/checks/check-board.github.mjs:HAS_PIPELINE`
- **Черновик при зелёном прогоне на вершине — расхождение сверки.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkReadyDraft`
- **Цвет прогона спрашивается отдельно от его наличия.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:verdictOnHead`
- **Конфликтующий открытый PR — расхождение сверки.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkConflicting`
- **Непосчитанная сливаемость конфликтом не считается.** — `projects/agent-kit/assets/checks/board.github.mjs:conflicting`
- **У конфликтующей заявки причиной названа не потеря события, а конфликт.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkHeadRun` — строка о конфликте печатается вместо строки о событии; сценарии SC-AK-670…672
