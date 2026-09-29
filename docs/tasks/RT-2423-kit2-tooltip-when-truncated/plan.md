# План

**Task:** RT-2423 · **Branch:** RT-2423-kit2-tooltip-when-truncated
**Draft:** `docs/specs/ui-kit-v2/proposed/tooltip-when-truncated/spec.md`
**Behaviour:** changes

## Task footprint

| What   | Where                                                                                      |
| ------ | ------------------------------------------------------------------------------------------ |
| Specs  | `docs/specs/ui-kit-v2/` — новый поддомен подсказки у обрезанного текста                    |
| Laws   | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`          |
| Rules  | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                 |
| Code   | `projects/ui-kit-v2/src/lib/components/tooltip/`                                           |
| Sample | `projects/ui-kit/src/lib/ui-kit/tooltip/hide-tooltip.directive.ts` — читается, не правится |

## What counts as done

- У `[rtTooltip]` второго кита есть режим, в котором подсказка показывается только у текста,
  который не поместился в свой узел, и признак пересчитывается при смене текста и размера.
- В режиме нет Material; прежнее поведение `[rtTooltip]` без режима не меняется.
- Режим описан в обзоре подсказки и показан историей витрины с кадром.

## Stages

### 1. Сличение и договорённость

- **Steps:**
    1. Сличить `rtHideTooltipDirective` первого кита с `[rtTooltip]` второго
    2. Записать договорённость и сценарии
- **Readiness sign:** договорённость лежит, её сценарии названы в проверке описаний
- **Verified by:** `npm run check:specs` — код выхода 0

### 2. Логика

- **Steps:**
    1. Чистая функция признака обрезанного текста
    2. Тесты логики
- **Readiness sign:** тесты функции зелёные
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-tooltip` — строка `Tests:` без `failed`

### 3. Режим директивы

- **Steps:**
    1. Вход режима у `[rtTooltip]` и пересчёт при смене текста и размера
    2. Тесты директивы, закрывающие сценарии
- **Readiness sign:** сценарии договорённости закрыты тестами, сборка пакета проходит
- **Verified by:** `pnpm run build:ui-kit-v2` — строка `Successfully ran target build`

### 4. Описание и витрина

- **Steps:**
    1. Обзор и `CONTEXT.md` подсказки
    2. История режима и её кадр, сличённый с первым китом
- **Readiness sign:** кадр истории снят и совпадает при повторном прогоне
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 'src/lib/components/tooltip/stories'` — строка `Snapshots:` без `failed`

### 5. Передача

- **Steps:**
    1. Полный набор проверок перед отправкой
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика с ревьюером
- **Verified by:** `gh pr view --json baseRefName` — `RT-2353-one-kit-part-2`

## What this work does not do

- Блок ошибки боковой панели — задача RT-2424 того же эпика.
- Первый кит не правится.
