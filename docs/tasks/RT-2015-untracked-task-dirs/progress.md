# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Установка файлов из пакета
- **Done:** правило и сценарий SC-AK-1185, проверка `checkUntrackedFolders`, тест зелёный (6 ok)
- **Next step:** установить файлы пакета, прогнать проверки перед push
- **Uncommitted:** нет
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Правило и сценарий в описании queue-check
- [x] 1.2 Отбор папок вне индекса в board-task-dirs
- [x] 1.3 Строка отказа в check-board
- [x] 1.4 Сценарий в checks-board-folders.test.sh
- [x] 2.1 Установить файлы пакета в дерево
- [>] 2.2 Прогнать проверки перед push

## Decisions along the way

- **Проверка легла в `board-folders.mjs`, а не в `board-task-dirs`** — этот модуль уже читает местный репозиторий; `check-board` стоит у предела длины файла. Affected stage of the plan: 1.

## Sessions

### 2026-10-03

- Ветка заведена, задача перенесена в работу вне эпика (эпик #2004 закрыт).
