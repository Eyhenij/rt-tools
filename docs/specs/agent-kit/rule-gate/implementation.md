# Привязка — гейт правил

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Конфиг линтера требует правило под собой.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **Проверка повторов требует правило, чьи признаки исполняет, и только его.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **Заведение рабочего дерева грузит правило поставки.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **Слои поверх доменного правила объявляются своим файлом, а не строками в гейте.** — `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_add`
- **Слой требует правило дополнительно, а не вместо доменного.** — `projects/agent-kit/assets/hooks/skill-gate.sh:want`
- **Признак, невидимый по пути, судится по тексту правки.** — `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_payload`
- **Слой, которому нечем прочитать текст правки, отпускает действие.** — `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_is_spec`
- **Файл слоёв гейт зовёт в своей оболочке, а не отдельным процессом.** — `projects/agent-kit/assets/hooks/skill-gate.sh:rt_hooks_dir`
- **Карта гейта считает командой вызов, а не упоминание.** — `projects/agent-kit/assets/defaults/gate-map.sh:rt_gate_invokes`
- **Перенаправление в пустое устройство и в поток ошибок записью не считается.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_writes_default`
- **Пути берутся из заголовка команды, а не из тела документа на месте.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_paths_default`
- **Пути берутся у пишущего куска команды, а не у строки целиком.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_paths_default`
