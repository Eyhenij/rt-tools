# Привязки — вытесненный из очереди прогон

Правило спека — слева, место, где оно исполняется, — справа. Пока код не написан, в правой
колонке стоит «не написано»: договорённость пишется раньше кода, и привязать её к
несуществующему символу нельзя.

| Правило                                                                   | Где исполняется                                                        |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Вытесненный прогон на вершине открытой заявки — расхождение сверки.       | `projects/agent-kit/assets/checks/check-board.github.mjs:checkEvicted` |
| Вытеснение узнаётся по числу заданий прогона, а не по слову отмены.       | `projects/agent-kit/assets/checks/board-runs.github.mjs:evictedOnHead` |
| Отменённый на ходу прогон вытеснением не называется.                      | `projects/agent-kit/assets/checks/board-runs.github.mjs:evictedOnHead` |
| Число заданий спрашивается только у отменённых прогонов вершины.          | `projects/agent-kit/assets/checks/board-runs.github.mjs:evictedOnHead` |
| Строка вытеснения называет обе команды и в том порядке, в каком их зовут. | `projects/agent-kit/assets/checks/check-board.github.mjs:checkEvicted` |
| Вытеснение судится раньше цвета и раньше отсутствия прогона.              | `projects/agent-kit/assets/checks/check-board.github.mjs:checkHeadRun` |
| Зелёный прогон на той же вершине снимает строку вытеснения.               | `projects/agent-kit/assets/checks/board-runs.github.mjs:evictedOnHead` |
| Дерево, не назвавшее файла конвейера, о вытеснении не судит.              | `projects/agent-kit/assets/checks/check-board.github.mjs:HAS_PIPELINE` |
