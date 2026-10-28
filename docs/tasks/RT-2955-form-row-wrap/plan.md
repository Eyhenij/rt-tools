# Plan

**Task:** RT-2955 · **Branch:** RT-2955-form-row-wrap
**Spec:** `docs/specs/ui-kit-v2/form-dictionary/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                       |
| ----- | ------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/form-dictionary/`     |
| Laws  | `docs/constitution/frontend-application.md` |
| Rules | `.claude/skills/testing/`                   |
| Code  | `projects/ui-kit-v2/src/styles/_form.scss`  |

## What counts as done

- Строка контрола переносит элементы.
- На узком месте строка из одних кнопок встаёт столбиком, кнопки во всю ширину.
- На 768 точках и шире кнопки стоят в ряд.
- Правило, сценарии и привязка записаны в спеке `form-dictionary`.

## Stages

### 1. Перенос и столбик строки кнопок

- **Steps:**
    1. Перенос и столбик в `_form.scss`
    2. Тесты стилей формы на два сценария
    3. Правило, сценарии и привязка в спеке
- **Readiness sign:** тесты стилей формы зелёные, сборка пакета зелёная.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Подвал панели не меняется.
