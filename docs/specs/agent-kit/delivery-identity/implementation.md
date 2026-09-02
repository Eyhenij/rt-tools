# Привязка — личность вызова, открывающего заявку

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Заявка, открываемая без подстановки токена машинной записи, отбивается.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var`
- **Отказ называет переменную токена и печатает готовую строку подстановки.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_hint`
- **Дерево, не назвавшее переменной токена, требования не получает.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_token_var`
- **Команда, названная путём, узнаётся наравне с голым именем.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND`
- **Упоминание имени команды внутри строки командой не считается.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND`
- **Черновик не снимается с заявки, открытой не машинной записью.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_author`
- **Отказ на снятии черновика называет обе записи и переоткрытие.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:pull_author`
- **Кто придёт по токену, спрашивается у хостинга, а не выводится из текста команды.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:token_login` — сценарий SC-AK-842
- **Спрашивает дерево, а не пакет.** — `projects/agent-kit/assets/defaults/project.sh:rt_pull_token_login` — умолчание молчит; реализация дерева в `.claude/rt-kit/project.sh`; сценарий SC-AK-842
- **Пустой ответ работу не заклинивает и называется вслух.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:token_login` — сценарий SC-AK-843
