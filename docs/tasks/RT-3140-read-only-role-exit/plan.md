# Plan

**Task:** RT-3140 · **Branch:** RT-3140-read-only-role-exit
**Spec:** `docs/specs/agent-kit/turn-guards/exit/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** роль без инструментов правки, запущенная через `claude -p --agent`, при открытом эпике не
  может закончить ход: запуск кончается `error_max_turns` с пустым `result`, и отчёта нет.
- **This task reaches:** владелец получает отчёт роли итоговым сообщением такого запуска.
- **Sign:** запуск `claude -p --agent product-strategist` на стенде с открытым эпиком даёт `success`
  и непустой `result`; до правки тот же запуск дал `error_max_turns`, 6 ходов.
- **Milestone G of the epic:** владелец принимает работу по таблице точек, а таблицу пишет эта роль.

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/exit/`                                          |
| Laws  | не меняются                                                                       |
| Rules | не меняются: роль только для чтения не исполнитель, правило о ходе не про неё     |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/`, `.claude/hooks/` |
| Plans | `docs/plans/pr-product-flow.md`                                                   |

## What counts as done

- Сценарий SC-AK-1272 стоит в спеке и закрыт тестом.
- Роль без инструментов правки заканчивает ход при открытом эпике, с первого прохода и на втором.
- Роль с `Edit` или без строки `tools:` и сессия без `agent_type` судятся как раньше.
- Запуск роли на стенде с открытым эпиком отдаёт её отчёт в итоговом сообщении.

## Stages

### 1. Проверка отпускает роль без инструментов правки

- **Steps:**
    1. Записать сценарий и тест
    2. Написать чтение роли и подключить его к проверке
    3. Разложить пакет
- **Readiness sign:** набор сценариев открытого эпика зелёный, строки SC-AK-1272 в нём есть.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-epic.test.sh` — последняя строка без провалов.

### 2. Запуск настоящей роли

- **Steps:**
    1. Запустить роль на стенде с открытым эпиком
    2. Записать спеку, привязку и план эпика
- **Readiness sign:** запуск кончился `success`, отчёт стоит в `result`; разложенное совпадает с пакетом.
- **Verified by:** `pnpm run agent-kit:check` — ни одного расхождения.

## What this work does not do

- Не трогает `claim-guard` и другие проверки: они судят слова отчёта, а не конец хода.
- Не отпускает встроенные роли без файла в дереве и роли из плагинов: такой файл проверке негде читать.
- Не меняет правило `turn-conduct`.
