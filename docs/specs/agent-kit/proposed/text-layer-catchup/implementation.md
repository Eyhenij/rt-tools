# Гейт трёх родов файлов, сверка голых имён и полнота указателя — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                            | Где исполняется                                                     |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Правило и паттерн судятся как спек, а не как файл агента.                          | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`  |
| Конфиг линтера требует правило под собой.                                          | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`  |
| Проверка повторов требует правило, чьи признаки исполняет, и только его.           | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`  |
| Голое имя и каталог судятся наравне с полным путём.                                | `projects/agent-kit/assets/checks/check-doc-paths.mjs:existsInTree` |
| Дерево для сверки путей берётся у системы контроля версий, а не обходом каталогов. | `projects/agent-kit/assets/checks/check-doc-paths.mjs:treeOfRepo`   |
| Папки задач выведены из сверки путей, как архив.                                   | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isSkipped`    |
| Полнота указателя каталога сверяется обеими сторонами.                             | `projects/agent-kit/assets/checks/check-doc-paths.mjs:checkIndex`   |
| Расхождение указателя печатается своим списком со своим доводом.                   | `projects/agent-kit/assets/checks/check-doc-paths.mjs:reportIndex`  |
