# Привязка — место правки

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Правка разложенной копии отбивается в минуту правки, а не на следующей раскладке.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:deny`
- **Отказ называет ресурс и адрес, где правка держится.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:deny`
- **Каталог источников спрашивается у профиля дерева, а не угадывается по имени.** — `projects/agent-kit/assets/defaults/project.sh:rt_kit_sources_dir`
- **Гард судит запись, а не инструмент.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`
- **Цель записи берётся у команды прямо, а не общим признаком записи.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`
- **Запись целиком поверх непустой надстройки отбивается отдельным отказом.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:deny`
- **Отказ о затирании называет размер того, что затрут.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:deny`
- **Дописывание в конец и правка по месту проходят.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:rt_overwrite_targets`
- **Снятие разложенной копии проходит.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`
- **Пустая надстройка и ненаписанная кладутся целиком.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:overrides_dir`
- **Копию образца под работу собирает команда, и шапку она снимает.** — `projects/agent-kit/assets/checks/board.github.mjs:unstampFolder`
- **Разложенный файл прячется от форматтера, и это стережёт проверка.** — `tools/check-format-ignore.mjs:STAMP` — шапка ищется в голове каждого файла дерева, и найденный сверяется со списком исключений
- **Судятся все файлы с шапкой раскладки, а не перечень каталогов.** — `tools/check-format-ignore.mjs:walk` — обход идёт по всему дереву, минуя сборку, зависимости и порождённое
- **Проверка своя дереву, а не пакетная.** — `tools/check-format-ignore.mjs:IGNORE_FILE` — читается `.prettierignore`; нет его — сверять нечем, и проверка молчит
- **Файл в конфликте гард пропускает наравне со снятым.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:ls-files` — признаков два: запись индекса о неслитом файле и маркеры слияния в самом файле; сценарий SC-AK-834

Имена этого дерева: источник — `projects/agent-kit/assets/<ресурс>`, каталог надстроек —
`.claude/rt-kit/overrides/`, профиль дерева — `.claude/rt-kit/project.sh`, настройка
форматтера — `.prettierignore`.

- **Тело интерпретатора без записи своих путей не отдаёт.** — `projects/agent-kit/assets/hooks/write-targets.sh:writes` — признак записи внутри тела; сценарий `SC-AK-858`
