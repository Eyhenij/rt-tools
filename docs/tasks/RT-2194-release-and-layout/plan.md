# Plan

**Task:** RT-2194 · **Branch:** RT-2194-release-and-layout
**Behaviour:** unchanged — снятие своей проверки дерева и переопределения, запись в описании прошлого; кода приложений не касается; владелец: «бери в работу изменения по остановке работ прямо сейчас»

## Task footprint

| What  | Where                                                                                         |
| ----- | --------------------------------------------------------------------------------------------- |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/delivery.md`                          |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/agent-kit/`, `.claude/skills/git-workflow/`   |
| Code  | `.claude/hooks/`, `.claude/rt-kit/overrides/`, `tools/tests/`, `docs/plans/executor-stops.md` |

## What counts as done

- В ветке нет своей проверки дерева против остановок, её сценариев и переопределения правила о
  ходе; файл привязок правила о ходе не ссылается на снятое.
- Установленное сходится с пакетом, наборы дерева зелёные.
- План эпика называет исход задач и шаг владельца: запуск конвейера публикации после слияния эпика.

## Stages

### 1. Снятие своей проверки и переопределения

- **What is done:** ветка RT-2187 влита в ветку задачи; сняты `.claude/hooks/work-continues-guard.sh`,
  `tools/tests/work-continues-guard.test.sh`, `.claude/rt-kit/overrides/rules/turn-conduct.md` и её
  раздел в файле привязок; правило о ходе переустановлено из пакета.
- **Readiness sign:** установленное сходится с пакетом, наборы дерева зелёные.
- **Verified by:** `npm run agent-kit:check` — нет строки о расхождении; `bash tools/tests/run.sh` — «ALL SETS ARE GREEN».

### 2. План эпика и описание прошлого

- **What is done:** таблица эпика называет исход задач; раздел о том, чем кончилось, называет шаг
  владельца — запуск конвейера публикации с подъёмом младшей версии после слияния эпика в main;
  запись задачи в описании прошлого.
- **Readiness sign:** аудит адресов зелёный.
- **Verified by:** `node tools/check-doc-paths.mjs` — «no divergences».

## What this work does not do

- Не поднимает версию пакета и не устанавливает издание сама: это делает конвейер публикации по
  запуску владельца, одним коммитом в main.
- Не трогает настройки одной машины с запретом на закрытие разговора: снятие — решение владельца
  после установки издания.
