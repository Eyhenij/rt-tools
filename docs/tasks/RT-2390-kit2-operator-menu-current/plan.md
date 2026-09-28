# План

**Task:** RT-2390 · **Branch:** RT-2390-kit2-operator-menu-current
**Spec:** `docs/specs/ui-kit-v2/table-full-port/spec.md`
**Behaviour:** changes

## След задачи

| Что      | Где                                                             |
| -------- | --------------------------------------------------------------- |
| Описания | `docs/specs/ui-kit-v2/table-full-port/`                         |
| Код      | `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/` |

## Что считается сделанным

- Меню оператора выводит операторы колонки без текущего, как первый кит.
- Правило и сценарий SC-UKV-371 говорят то же; тест сценария переписан.
- Тесты и кадры второго кита зелёные.

## Этапы

### 1. Правка

- **Steps:**
    1. Убрать текущий оператор из пунктов меню
    2. Переписать правило, сценарий и тест
- **Readiness sign:** тесты второго кита зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — `Tests:` без `failed`

### 2. Кадры и PR

- **Steps:**
    1. Прогнать кадры второго кита и просмотреть разошедшиеся
    2. Открыть PR в ветку эпика и пересобрать пакет
- **Readiness sign:** ворота кадров зелёные.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — `Snapshots:` без `failed`

## Чего эта работа не делает

- Не убирает вход `current` у пункта меню.
