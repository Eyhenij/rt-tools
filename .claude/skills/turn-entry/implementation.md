# turn-entry — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом.

## Как это называется здесь

- **В правиле** — Здесь
- **каталог передач** — `.claude/handoff/` — вне истории, файл на ветку; каталог задаёт `RT_HANDOFF_DIR` профиля
- **карта хода** — `.claude/rt-kit/defaults/turn-map.md` — ресурс рода умолчаний, разложенный пакетом
- **хук входа** — `.claude/hooks/turn-entry-load.sh`, объявлен в `.claude/settings.json`
- **проверка карты** — `tools/check-turn-map.mjs`, команда `pnpm run check:turn-map`

## Где это лежит

- **хук входа** — `.claude/hooks/turn-entry-load.sh`
- **текст карты** — `.claude/rt-kit/defaults/turn-map.md`
- **проверка карты** — `tools/check-turn-map.mjs`
- **сценарии хука** — `projects/agent-kit/tests/turn-entry-load.test.sh`
- **хук, пишущий передачу** — `.claude/hooks/handoff-write.sh`

## Где исполняются статьи

- **The past session's handover comes into the context by the same launch as the work state.** — `.claude/hooks/turn-entry-load.sh:handoff` — стоит в той же группе хуков старта, что и загрузка состояния работы
- **The handover is taken by the name of the current branch.** — `.claude/hooks/turn-entry-load.sh:branch` — имя файла собирается из ветки, а не выбирается из каталога
- **No handover — the entry is silent about it.** — `.claude/hooks/turn-entry-load.sh:handoff_dir` — блок печати стоит под проверкой читаемости файла
- **The turn map comes by the same launch and lies as a file of its own, not pulled out of the rule.** — `.claude/hooks/turn-entry-load.sh:map` — путь к ресурсу умолчаний, разбора правила в хуке нет вовсе
- **The map is shorter than the rule, and its limit is set by the tree's check.** — `tools/check-turn-map.mjs:LIMIT_BYTES`
- **A state declared by the rule and forgotten in the map is a divergence.** — `tools/check-turn-map.mjs:statesOf` — имена сверяются с таблицей правила в обе стороны
- **Text that travels into the context is written as a list, not a table.** — `tools/check-turn-map.mjs:statesOf` — читает обе формы: строку списка и строку таблицы; список разбирается только в карте, потому что в правиле тем же видом записаны паттерны
- **The entry is served on all four launches, not only after compaction.** — `.claude/hooks/turn-entry-load.sh:rt-hook` — строка объявления в шапке называет все четыре запуска, раскладка переносит её в настройки
- **The entry hook does not refuse the launch.** — `.claude/hooks/turn-entry-load.sh:exit` — все ветки кончаются нулём, вывод пуст, когда читать нечего

## Чего из правила здесь нет

Всё исполняется. Проверка карты стоит в наборе гейта пуша рядом со сверкой состояний, сценарии
хука — в общем прогоне наборов пакета.
