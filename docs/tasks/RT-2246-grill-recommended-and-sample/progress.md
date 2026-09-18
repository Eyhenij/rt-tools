# Progress

- **State:** `этап-идёт`
- **Stage:** 2 из 2 — Тексты: паттерн начала работы, правило ведения хода, файл привязок
- **Next step:** статьи в `task-flow-start`, статья в `turn-conduct`, строка привязок, установка файлов из пакета, проверка описаний
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** нет

## Decisions along the way

- **Этап 1 закрыт** — grill-gate 28 ok, turn-exit-guard 101 ok, turn-exit-epic 32 ok, waiting-turn-guard 41 ok; `npm run check:specs` без находок по домену; файлы разложены.
- **Ярус запуска в фоне лежит в `turn-exit-epic.sh`, а не в самой проверке** — файл проверки на пределе длины; ярус состоянием эпика не ограничен.
