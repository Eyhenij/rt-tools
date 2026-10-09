# Plan

**Task:** RT-2706 · **Branch:** RT-2706-auth-init-timeout
**Spec:** `docs/specs/auth/angular/scenarios.md`
**Behaviour:** changes

## Task footprint

| What  | Where                         |
| ----- | ----------------------------- |
| Specs | `docs/specs/auth/angular/`    |
| Rules | `.claude/skills/spec-driven/` |
| Code  | `projects/auth-angular/`      |

## What counts as done

- Тихая проверка, которая не ответила, не держит старт дольше предела, и после него никто не вошёл.
- Тесты, линт и сборка пакета зелёные, номер пакета 0.1.1.

## Stages

### 1. Предел ожидания тихой проверки

- **Steps:**
    1. Поле настройки и предел по умолчанию в старте службы входа
    2. Двойник адаптера умеет молчать, тест SC-AUTH-76, сценарий и README
    3. Номер пакета 0.1.1
- **Readiness sign:** тест SC-AUTH-76 зелёный, сборка пакета проходит.
- **Verified by:** `pnpm exec nx run-many -p @rt-tools/auth-angular -t test lint build` — `Successfully ran targets test, lint, build`

## What this work does not do

- Выпуск пакета в реестр: его запускает конвейер выпуска после слияния.
