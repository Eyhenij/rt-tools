# Plan

**Task:** RT-3171 · **Branch:** RT-3171-e2e-guard-kit2-reach
**Behaviour:** unchanged — проверка дерева, а не код приложения; владелец: «Починить проверку»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** правка календаря второго кита не открывает PR: проверка требует тест в примере входа, где
  календаря нет.
- **This task reaches:** PR с правкой компонента, который приложение не рисует, открывается без
  теста в этом приложении.
- **Sign:** сценарии `tools/tests/e2e-coverage-guard.test.sh` — правка календаря проходит, правка
  кнопки внутри поля примера требует набор примера.
- **Milestone G of the epic:** вне эпика.
- **Metric:** отказов проверки покрытия на правки кита без затронутого приложения — ноль; было — на
  каждую.

## Task footprint

| What  | Where                                       |
| ----- | ------------------------------------------- |
| Rules | `.claude/rt-kit/overrides/rules/testing.md` |
| Code  | `.claude/hooks/e2e-coverage-guard.sh`       |
| Code  | `.claude/rt-kit/project.sh`                 |
| Tests | `tools/tests/e2e-coverage-guard.test.sh`    |

## What counts as done

- Правка компонента, который приложение не рисует, не требует набор этого приложения.
- Правка компонента, нарисованного внутри другого, требует набор приложения.

## Stages

### 1. Проверка судит по тому, что рисует приложение

- **Steps:**
    1. Функция профиля rt_kit2_reaches
    2. Проверка покрытия зовёт функцию
    3. Сценарии и статья правила
- **Readiness sign:** сценарии зелёные.
- **Verified by:** `bash tools/tests/e2e-coverage-guard.test.sh` — строка «0 failures».
