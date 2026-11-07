# Plan

**Task:** RT-3160 · **Branch:** RT-3160-epic-agreement-gate
**Behaviour:** unchanged — владелец выбрал «Поправить проверку (Recommended)» и «Отдельный PR в main (Recommended)»: правка касается проверки, а не приложения

## Points

- **A:** договорённость на весь эпик запрещает PR первой задачи в ветку эпика, а PR эпика в main договорённость не проверяет.
- **This task reaches:** PR задачи открывается в ветку эпика, PR эпика в main отказывает, пока договорённость не влита.
- **Sign:** `bash projects/agent-kit/tests/git-guards-agreement.test.sh` даёт 9 ok, после слияния PR RT-3152 открывается.
- **Milestone G of the epic:** работа вне эпика, она открывает путь задачам эпика RT-3151.

## Task footprint

| What  | Where                                      |
| ----- | ------------------------------------------ |
| Specs | `docs/specs/agent-kit/delivery-agreement/` |
| Code  | `projects/agent-kit/assets/hooks/`         |
| Tests | `projects/agent-kit/tests/`                |

## What counts as done

- PR в ветку эпика не отказывает из-за договорённости.
- PR в main отказывает по плану любой задачи в ветке.
- Набор проверок перед отправкой зелёный.

## Stages

### 1. Перенести правку проверки

- 1.1 Перенести проверку, спеку и сценарии из готового коммита
- 1.2 Разложить проверку и запустить сценарии
