# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — разбор записи хода
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
- Ветка RT-2191 отведена от ветки эпика, замысел написан. Исполнитель кончил ход у порога окна, хотя уплотнение настроено: третья остановка сессии под запретом владельца, разбор написан. Первый этап начат в той же сессии.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-worktree-2
**Branch:** RT-2191-turn-exit-second-pass

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — разбор записи хода
- **Next step:** начать первый этап — в `projects/agent-kit/assets/hooks/turn-exit-verdict.sh` исключить сообщения с признаком meta из начала хода и слов владельца, читать отказ по последнему результату инструмента, добавить сценарии в `projects/agent-kit/tests/turn-exit-guard.test.sh`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2191-turn-exit-second-pass/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-2191-turn-exit-second-pass/progress.md
?? docs/tasks/RT-2041-ambiguous-names-unwired/
?? docs/tasks/RT-2179-chat-operator-read/
?? docs/tasks/RT-2180-chat-event-stream/
?? docs/tasks/RT-2182-chat-site-widget/
?? docs/tasks/RT-2183-chat-operator-alerts/
?? docs/tasks/RT-2184-chat-service-deploy/
?? docs/tasks/RT-2192-stop-rules-articles/
?? docs/tasks/RT-2193-end-conversation-guard/
?? docs/tasks/RT-2194-release-and-layout/
?? libs/chat-api/
```

### Commits over the main branch

```
cb5974789 docs: заведена папка задачи RT-2191 — пакетная проверка выхода из хода при открытом эпике
69fe788b7 docs: заведён эпик RT-2190 — исполнитель не останавливается сам, пока эпик не закрыт
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
