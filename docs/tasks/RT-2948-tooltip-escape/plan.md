# Plan

**Task:** RT-2948 · **Branch:** RT-2948-tooltip-escape
**Spec:** `docs/specs/ui-kit-v2/component-additions/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/component-additions/`                     |
| Laws  | `docs/constitution/frontend-application.md`                     |
| Rules | `.claude/skills/testing/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/tooltip/`                |

## What counts as done

- Escape на хосте закрывает открытую подсказку и гасится.
- Escape при закрытой подсказке доходит до родителя.
- После Escape повторный фокус с клавиатуры показывает подсказку.
- Правило и сценарии записаны в спеке `component-additions`, `CONTEXT.md` директивы обновлён.

## Stages

### 1. Escape в директиве

- **Steps:**
    1. Обработчик `keydown` на хосте в `RtTooltipDirective`
    2. Тесты директивы на три сценария
    3. Правило, сценарии и привязка в спеке, `CONTEXT.md`
- **Readiness sign:** тесты директивы зелёные, сборка пакета зелёная.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Задержка показа и сторона подсказки не меняются.
