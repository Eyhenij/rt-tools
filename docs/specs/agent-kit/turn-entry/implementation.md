# Привязка — передача захода и вход в новый заход

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

| Правило                                                                             | Где исполняется                                                   |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Передача захода пишется перед сжатием контекста, а не рукой исполнителя.            | `projects/agent-kit/assets/hooks/handoff-write.sh:target`         |
| Хук передачи ничего от себя не добавляет.                                           | `projects/agent-kit/assets/hooks/handoff-write.sh:line_of`        |
| Написанное хуком — нижняя граница передачи.                                         | `projects/agent-kit/assets/hooks/handoff-write.sh:handoff_dir`    |
| Хук передачи сжатие не отбивает.                                                    | `projects/agent-kit/assets/hooks/handoff-write.sh:trigger`        |
| Передача прошлого захода приходит в контекст на запуске, а не кладётся в чат рукой. | `projects/agent-kit/assets/hooks/turn-entry-load.sh:handoff`      |
| Передача берётся по имени текущей ветки.                                            | `projects/agent-kit/assets/hooks/turn-entry-load.sh:branch`       |
| Передачи нет — вход об этом молчит.                                                 | `projects/agent-kit/assets/hooks/turn-entry-load.sh:handoff_dir`  |
| Карта хода приходит в контекст на том же запуске, что и передача.                   | `projects/agent-kit/assets/hooks/turn-entry-load.sh:map`          |
| Карта называет обязательное действие каждого состояния и четыре выхода хода.        | `projects/agent-kit/assets/checks/check-turn-map.mjs:EXITS`       |
| Карта живёт своим файлом ресурса пакета.                                            | `projects/agent-kit/assets/checks/check-turn-map.mjs:MAP`         |
| Карта короче правила и этим отличается от него.                                     | `projects/agent-kit/assets/checks/check-turn-map.mjs:LIMIT_BYTES` |
| Вход подаётся на всех четырёх запусках, а не только после сжатия.                   | `projects/agent-kit/assets/hooks/turn-entry-load.sh:rt-hook`      |
| Хук входа запуск не отбивает.                                                       | `projects/agent-kit/assets/hooks/turn-entry-load.sh:rt_hooks_dir` |
| Порог сжатия стоит ниже порога остановки.                                           | `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift`         |
| Совпадение порогов — расхождение, а не согласие.                                    | `projects/agent-kit/src/lib/thresholds.ts:tied`                   |
| Расстояние между порогами объявлено, а не выведено.                                 | `projects/agent-kit/src/lib/thresholds.ts:marginPct`              |
| Дерево, не объявившее сжатия, работает как прежде.                                  | `projects/agent-kit/src/lib/thresholds.ts:compactPct`             |
| Отказ называет обе стороны числами.                                                 | `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`         |
| Заполненное окно кончает ход только там, где сжатия нет.                            | `projects/agent-kit/assets/checks/check-turn-map.mjs:EXITS`       |
