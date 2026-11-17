# Plan

**Task:** RT-3362 · **Branch:** RT-3362-kit-approval-epic-branch
**Behaviour:** unchanged — правка инструмента дерева, приложения и пакеты не меняются; слово владельца «Делай эпик дальше»: без починки ветка эпика не отправляется

## Points

- **A:** отправку ветки эпика RT-3346 набор отказывает: «RT-3346-ai-chat-blocks: no approval record», хотя у влитой RT-3334 оба одобрения записаны.
- **This task reaches:** ветка эпика, в которой правки кита пришли слияниями задач с одобрениями, уходит на сервер.
- **Sign:** `node tools/check-kit-approval.mjs` на ветке эпика с влитой задачей — «no visible kit edit without approvals».
- **Milestone G of the epic:** вне эпика; открывает отправку эпика RT-3346.
- **Metric:** нет: проверка не знала о слияниях задач в режиме ветки.

## Task footprint

| What  | Where                                  |
| ----- | -------------------------------------- |
| Specs | нет: у проверки нет спека, `node tools/specs-for.mjs` отвечает «matched by nothing» |
| Laws  | `docs/constitution/mockups.md`         |
| Rules | `.claude/skills/kit-approval/`         |
| Code  | `tools/check-kit-approval.mjs`, `tools/tests/check-kit-approval.test.sh` |

## What counts as done

- Если у ветки нет своей записи, правку кита, пришедшую слиянием PR с `[RT-<номер>]` в теме, судит запись этой задачи в архиве.
- Правка кита, сделанная прямо в ветке без записи, по-прежнему отказывает.
- Правку, пришедшую слиянием `main`, проверка не судит.

## Stages

### 1. Режим ветки судит слияния задач

- **Steps:**
    1. Вынести поиск записи задачи из режима выпуска в общую функцию
    2. Режим ветки разбирает первых родителей от базы: слияние задачи судит запись задачи, прямой коммит судит запись ветки
    3. Сценарии в тесте: эпик со слиянием задачи проходит, прямая правка в эпике без записи отказывает
- **Readiness sign:** тест зелёный, на ветке эпика RT-3346 проверка молчит.
- **Verified by:** `bash tools/tests/check-kit-approval.test.sh` — «0 failures», сейчас «29 ok».

### 2. Тексты и отправка

- **Steps:**
    1. Компаньон правила `kit-approval` называет запись задачи для ветки эпика
    2. Папка задачи разобрана в архив, набор, PR в main
- **Readiness sign:** набор зелёный, PR открыт.
- **Verified by:** `node tools/check-kit-approval.mjs` — «no visible kit edit without approvals» на ветке эпика после слияния main.

## What this work does not do

- Режим выпуска меняется только выносом общей функции.
- Формат записи одобрений не меняется.
