# Привязка — конфликтующая своя заявка

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Взятие новой работы отбивается, пока хоть одна своя открытая заявка помечена конфликтующей.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:rt_delivery_conflict`
- **Работой считаются четыре команды: заведение задачи, заведение ветки под задачу, перевод колонки в работу и открытие заявки.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:taking`
- **Починка конфликта не отбивается ничем.** — **Не проверяется отдельным признаком.** Отбивается только названный список команд; всё прочее гард пропускает молча.
- **Судится только прямое «конфликтует».** — `projects/agent-kit/assets/checks/board.github.mjs:conflictingPulls`
- **Своими считаются заявки машинной записи дерева.** — `projects/agent-kit/assets/checks/board.github.mjs:conflictingPulls`
- **Отказ называет номер и ветку каждой конфликтующей заявки.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:listed`
- **Ветка без номера задачи взятием работы не считается.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:taking`
- **Перевод колонки судится вместе с именем колонки.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:taking`
- **Молчание опроса работу не отбивает.** — `projects/agent-kit/assets/defaults/project.sh:rt_conflicting_pulls_default`
