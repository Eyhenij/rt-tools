# Привязка — гарды хода работы

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Код приложения не правится, пока нет папки задачи, замысла в ней и объявленного состояния.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:progress`
- **Судится объявленный переход, а не наличие файлов.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state`
- **Отказ называет обязательное действие того состояния, которое объявлено.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`
- **Папка, разобранная коммитом ветки, снимает требование замысла.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:folder_archived`
- **Папка задачи едет в ветку коммитом, а не живёт в одном рабочем дереве.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:in_tree`
- **Договорённость требуется по путям правки, а не по оценке задачи.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_candidates`
- **Договорённость называется одним из двух видов — черновиком в каталоге «предложено» либо спеком домена.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft`
- **Названная договорённость обязана существовать на диске или в истории ветки.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft_path`
- **Обход требования договорённости — строка о неизменном поведении с причиной владельца.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:plan`
- **Правка, положенная командой оболочки, судится наравне с правкой инструментом.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_cmd`
- **Снятие пути, которого в истории нет, правкой продукта не считается.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_removes`
- **Разложенный слой правил судится наравне с кодом приложения.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_laid_out`
