# Plan

**Task:** RT-2980 · **Branch:** RT-2980-tooltip-touch
**Spec:** `docs/specs/ui-kit-v2/tooltip-keep-on-click/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                               |
| ----- | --------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/tooltip-keep-on-click/`       |
| Code  | `projects/ui-kit-v2/src/lib/components/tooltip/`    |
| Code  | `projects/ui-kit-v2/src/lib/components/usage-ring/` |

## What counts as done

- Касание хоста с `rtTooltipShowOnTap` открывает подсказку сразу, повторное касание и касание вне
  закрывают; без входа касание подсказку не показывает; кольцо расхода ставит вход.

## Stages

### 1. Касание открывает подсказку хоста без действия

- **Steps:**
    1. Вход `rtTooltipShowOnTap` в директиве подсказки
    2. Кольцо расхода ставит вход
    3. Тесты SC-UKV-1051…1055
    4. Спек поддомена, привязка и описание подсказки
- **Readiness sign:** тесты подсказки и кольца проходят
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/tooltip projects/ui-kit-v2/src/lib/components/usage-ring` — «Tests: N passed», ни одного упавшего

## What this work does not do

- Подъём кита в VillaManager и сквозной тест там — задача VM-3125.
