# Plan

**Task:** RT-3617 · **Branch:** RT-3617-sheet-owner-remarks
**Spec:** `docs/specs/ui-kit-v2/sheet-header-cards/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** в ветке эпика шторки кита на телефоне без шести правок владельца: шторка выходит за своё
  место, высота шторки даты прыгает, чипы периода в две строки, стрелки месяца выше названия,
  календарь меняет высоту, шторка поднимается до появления клавиатуры.
- **This task reaches:** все шесть правок в ветке эпика.
- **Sign:** истории `Molecules/Forms/DateSheet` и `Molecules/Forms/SelectSheet` в витрине на
  ширине 375; владелец посмотрел их на своём телефоне.
- **Milestone G of the epic:** все правки эпика влиты в главную ветку и готовы к выпуску кита.
- **Metric:** нет: правки владельца не дошли до ветки эпика.

## Task footprint

| What  | Where                                      |
| ----- | ------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/sheet-header-cards/` |
| Specs | `docs/specs/message-bus/admin-shell/`      |
| Laws  | `docs/constitution/mockups.md`             |
| Rules | `.claude/skills/kit-approval/`             |
| Code  | `projects/ui-kit-v2/`                      |

## What counts as done

- Номера сценариев шторки не совпадают с номерами главной.
- Пять коммитов правок лежат в ветке задачи, тесты шторок и дат зелёные.

## Stages

### 1. Номера сценариев и перенос правок

- **Steps:**
    1. Перенумеровать сценарии шторки, занятые главной
       Check: `node tools/check-specs.mjs` → exit 0
    2. Перенести пять коммитов правок владельца
       Check: `grep -c rtChipCarousel projects/ui-kit-v2/src/lib/components/date-range/panel/rt-date-range-panel.component.html` → >= 1
    3. Прогнать тесты шторок, календаря и дат
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testPathPatterns=bottom-sheet|calendar|date|select` → exit 0
- **Readiness sign:** номера сценариев свободны, правки в ветке, тесты зелёные.
- **Verified by:** `node tools/check-specs.mjs` — выход 0.

## What this work does not do

- Асайд шторкой во всю высоту — RT-3532.
- Карточки таблицы по конфигу — RT-3605.
