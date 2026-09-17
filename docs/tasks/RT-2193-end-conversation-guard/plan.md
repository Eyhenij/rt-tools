# Plan

**Task:** RT-2193 · **Branch:** RT-2193-end-conversation-guard
**Behaviour:** unchanged — проверка пакета правил, её сценарии и статья; кода приложений не касается; владелец: «бери в работу изменения по остановке работ прямо сейчас»

## Task footprint

| What  | Where                                                                                                |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Laws  | `docs/constitution/work-conduct.md`                                                                  |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/agent-kit-source/`                                   |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/`, `docs/specs/agent-kit/turn-guards/` |

## What counts as done

- Вызов инструмента завершения разговора отклоняется проверкой пакета всегда, с текстом о том, что
  сессию заканчивает владелец; другие инструменты проходят.
- Сценарии проверки в наборе пакета зелёные; статья в правиле о ходе с привязкой; аудит описаний
  зелёный; проверка установлена в дереве.

## Stages

### 1. Проверка и её сценарии

- **What is done:** `projects/agent-kit/assets/hooks/end-conversation-guard.sh` объявлена на событие
  перед вызовом с именем инструмента, отказывает всегда решением «deny» и текстом о владельце;
  набор `projects/agent-kit/tests/end-conversation-guard.test.sh` — отказ по имени и по имени с
  префиксом, пропуск других инструментов, отказ без разборщика JSON.
- **Readiness sign:** набор зелёный, разбор ресурсов пакета зелёный.
- **Verified by:** `bash projects/agent-kit/tests/end-conversation-guard.test.sh` — «0 провалов»; `bash projects/agent-kit/tests/syntax.test.sh` — «0 провалов».

### 2. Статья и договорённость

- **What is done:** статья в `turn-conduct.md` о том, что сессию заканчивает владелец; статья, сценарий
  и привязка в договорённости о проверках конца хода; строка в файле привязок правила о ходе.
- **Readiness sign:** аудит описаний зелёный, предел веса правила не превышен.
- **Verified by:** `npm run check:specs` — без расхождений; `node tools/check-file-size.mjs` — «no new ones».

### 3. Сборка и установка

- **What is done:** пакет собран, проверка установлена в дерево, подписка на событие в настройках
  уже есть.
- **Readiness sign:** установленное сходится с пакетом, наборы дерева зелёные.
- **Verified by:** `npm run agent-kit:check` — нет строки о расхождении; `bash tools/tests/run.sh` — «ALL SETS ARE GREEN».

## What this work does not do

- Настройки одной машины не трогает: запрет там остаётся до установки издания, снятие — решение
  владельца.
- Издание пакета и снятие переопределения — RT-2194.
