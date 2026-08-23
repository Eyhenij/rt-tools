# Привязка — место правки

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

| Правило                                                                           | Где исполняется                                                                |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Правка разложенной копии отбивается в минуту правки, а не на следующей раскладке. | `projects/agent-kit/assets/hooks/rule-source-guard.sh:deny`                    |
| Отказ называет ресурс и адрес, где правка держится.                               | `projects/agent-kit/assets/hooks/rule-source-guard.sh:deny`                    |
| Каталог источников спрашивается у профиля дерева, а не угадывается по имени.      | `projects/agent-kit/assets/defaults/project.sh:rt_kit_sources_dir`             |
| Гард судит запись, а не инструмент.                                               | `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`        |
| Цель записи берётся у команды прямо, а не общим признаком записи.                 | `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`        |
| Запись целиком поверх непустой надстройки отбивается отдельным отказом.           | `projects/agent-kit/assets/hooks/override-write-guard.sh:deny`                 |
| Отказ о затирании называет размер того, что затрут.                               | `projects/agent-kit/assets/hooks/override-write-guard.sh:deny`                 |
| Дописывание в конец и правка по месту проходят.                                   | `projects/agent-kit/assets/hooks/override-write-guard.sh:rt_overwrite_targets` |
| Снятие разложенной копии проходит.                                                | `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`        |
| Пустая надстройка и ненаписанная кладутся целиком.                                | `projects/agent-kit/assets/hooks/override-write-guard.sh:overrides_dir`        |

Имена этого дерева: источник — `projects/agent-kit/assets/<ресурс>`, каталог надстроек —
`.claude/rt-kit/overrides/`, профиль дерева — `.claude/rt-kit/project.sh`, настройка
форматтера — `.prettierignore`.
