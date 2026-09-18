# Plan

**Task:** RT-2246 · **Branch:** RT-2246-grill-recommended-and-sample
**Spec:** `docs/specs/agent-kit/turn-guards/`
**Behaviour:** unchanged — правится слой правил, код приложений не задет; так поставлена задача эпика.

## Task footprint

| What  | Where                                                                                        |
| ----- | -------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/`, `docs/specs/agent-kit/turn-guards/exit/`                |
| Laws  | `docs/constitution/work-conduct.md`                                                          |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/task-flow-start/`                            |
| Code  | `projects/agent-kit/assets/hooks/grill-gate.sh`, `turn-exit-verdict.sh`, `turn-exit-epic.sh` |

## Stages

### 1. Проверки: серия «рекомендованный» и запуск в фоне последним действием

Третий признак проверки разговора: два последних ответа владельца на меню — рекомендованные
варианты, следующее меню отбивается. Ярус проверки конца хода: последнее действие — запуск роли
или команды в фоне, ход не отпускается. Сценарии SC-AK-1134 и SC-AK-1135, описание домена.

**Checked by:** `bash projects/agent-kit/tests/grill-gate.test.sh && bash projects/agent-kit/tests/turn-exit-guard.test.sh`

### 2. Тексты: паттерн начала работы, правило ведения хода, файл привязок

Паттерн `task-flow-start`: поиск готового модуля того же рода до первого вопроса; два ответа
«рекомендованный» подряд закрывают остальные вопросы допущением. Правило `turn-conduct`: запуск в
фоне последним действием — объявление намерения. Строки привязок, установка файлов из пакета,
проверка описаний.

**Checked by:** `pnpm run agent-kit:sync && npm run check:specs`
