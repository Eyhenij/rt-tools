# Progress

## Where we stand

- **State:** `замысел-записан`
- **Stage:** 1 of 3 — разбор записи хода, не начат
- **Done:** эпик RT-2190 заведён с четырьмя задачами, его ветка отправлена; ветка задачи отведена от ветки эпика, задача и карточка эпика в колонке «в работе»; разбор просьбы и замысел лежат в папке
- **Next step:** начать первый этап — в `projects/agent-kit/assets/hooks/turn-exit-verdict.sh` исключить сообщения с признаком meta из начала хода и слов владельца, читать отказ по последнему результату инструмента, добавить сценарии в `projects/agent-kit/tests/turn-exit-guard.test.sh`
- **Uncommitted:** ничего после коммита папки
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **Образец пакетной правки — своя проверка дерева из RT-2187** — `.claude/hooks/work-continues-guard.sh` в ветке RT-2187 и её сценарии `tools/tests/work-continues-guard.test.sh`: чтение эпика, четыре выхода, служебные сообщения, отказ последним действием. В ветке эпика этого файла нет, читать его командой `git show RT-2187-work-continues-guard:.claude/hooks/work-continues-guard.sh`. Затронут этап плана: 1.

## Sessions

### 2026-09-17

- Эпик RT-2190 заведён по слову владельца, задачи RT-2191…RT-2194 созданы разом, план эпика в его ветке, ветка отправлена.
- Ветка RT-2191 отведена от ветки эпика, замысел написан; окно сессии дошло до порога, первый этап начинает следующая сессия.

## Handover of the session

### Where we stand at the minute of the handover

Ветка `RT-2191-turn-exit-second-pass` от `RT-2190-executor-stops`, папка задачи с разбором,
замыслом и ходом работы. Кода пакета ещё не тронуто. Слово владельца в силе: эпик чата RT-2177
отложен, эпик RT-2190 в работе, останавливаться до его закрытия нельзя.

### What the next session does first

1. Загружает правила `agent-kit-source` и `task-flow-resume`, читает `git show RT-2187-work-continues-guard:.claude/hooks/work-continues-guard.sh` как образец.
2. Правит `projects/agent-kit/assets/hooks/turn-exit-verdict.sh` по первому этапу замысла, добавляет сценарии, гоняет `bash projects/agent-kit/tests/turn-exit-guard.test.sh`.
3. Переписывает состояние на `этап-идёт` и ведёт работу по замыслу до PR в ветку эпика.

### What stands outside this branch

- PR #2189 задачи RT-2187 в main ждёт запуска CI и снятия черновика владельцем.
- Ветка RT-2178 стоит на слове владельца; соседняя сессия ведёт RT-2179 от ветки эпика чата.
