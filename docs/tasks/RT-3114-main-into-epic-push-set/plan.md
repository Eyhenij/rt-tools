# Plan

**Task:** RT-3114 · **Branch:** RT-3114-main-into-epic-push-set
**Behaviour:** unchanged — обе правки уже влиты каждая в свою ветку, задача сводит их в один цикл

## Task footprint

| What  | Where                                                                          |
| ----- | ------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/pre-push-hook/`, `docs/specs/agent-kit/push-gate-ahead/` |
| Rules | `.claude/skills/git-workflow/`                                                 |
| Code  | `projects/agent-kit/assets/hooks/`                                             |

## What counts as done

- Проверка в сессии и git-хук идут одним циклом и читают отметки зелёных шагов.
- Тяжёлые шаги заранее запрашивает только проверка в сессии.
- Main влита, сценарии отправки проходят.

## Stages

### 1. Свести два цикла

- **Steps:**
    1. Слить main и снять конфликт в разложенных хуках
    2. Перенести отметки и базу стопки в `push-set.sh`
    3. Разложить пакет и проверить сценарии
- **Readiness sign:** оба набора сценариев проходят, раскладка сходится с пакетом.
- **Verified by:** `bash projects/agent-kit/tests/pre-push.test.sh` — итог без красных сценариев

## What this work does not do

- Команда `git-guard-push-ahead.sh` остаётся со своим циклом: она печатает ход работы построчно.
