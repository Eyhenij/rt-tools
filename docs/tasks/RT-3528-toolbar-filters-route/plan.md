# Plan

**Task:** RT-3528 · **Branch:** RT-3528-toolbar-filters-route
**Spec:** `docs/specs/ui-kit-v2/toolbar-filters/spec.md`
**Behaviour:** changes

## Points

- **A:** кнопка фильтров полосы сама открывает панель кита службой; на ровно 1080 уже кнопка.
- **This task reaches:** приложение открывает панель отборов своим маршрутом и рисует в нём часть
  кита с полями и подвалом; на 1080 отборы стоят в строке, на 1079 — кнопка.
- **Sign:** тесты кита `SC-UKV-1710`–`SC-UKV-1715` зелёные; новая версия видна в
  `npm view @rt-tools/ui-kit-v2 versions --json`.
- **Milestone G of the epic:** вне эпика: приёмка задачи приложения-потребителя.
- **Metric:** нет: не хватало режима, и порог стоял на 1 px выше.

## Task footprint

| What  | Where                                                                                     |
| ----- | ----------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/toolbar-filters/`                                                   |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`         |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/`, `projects/ui-kit-v2/src/lib/platform/` |

## What counts as done

- На месте 1080 отборы стоят в полосе, на 1079 — кнопка; общий `narrow` не изменился.
- При `filtersPanel="app"` кнопка сообщает `filtersOpen` и своей панели не открывает.
- `rt-toolbar-filters-panel` в маршруте приложения рисует поля из шаблона полосы и подвал, нажатия
  доходят до `filtersReset` и `filtersApply` полосы.
- Без нового входа полоса ведёт себя как в 0.51.0.
- Новая версия кита (minor) опубликована.

## Stages

### 1. Порог отборов

- **Steps:**
    1. Признак `belowNarrow` в службе ширины и полоса на нём
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/platform/breakpoints.service.spec.ts` → exit 0
- **Readiness sign:** на 1080 полоса, на 1079 кнопка.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/platform/breakpoints.service.spec.ts` — все тесты зелёные.

### 2. Панель у приложения

- **Steps:**
    1. Вход `filtersPanel`, выход `filtersOpen` и часть кита `rt-toolbar-filters-panel`
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/toolbar` → exit 0
    2. История витрины и описание полосы
       Check: `node tools/check-specs.mjs` → exit 0
- **Readiness sign:** тесты режима и порога зелёные, история в витрине открывается.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/toolbar` — все тесты зелёные.

### 3. Поставка

- **Steps:**
    1. Два круга ревью, набор перед отправкой, PR и слияние
       Check: `node tools/check-specs.mjs` → exit 0
    2. Выпуск кита minor
       Check: `npm view @rt-tools/ui-kit-v2 version` → /^0\.52\.0$/
- **Readiness sign:** версия опубликована.
- **Verified by:** `npm view @rt-tools/ui-kit-v2 versions --json` — в списке новая версия.

## What this work does not do

- Общий порог `narrow` и стили `$rt-bp-lg` других компонентов.
- Маршрут панели в самом приложении — его собирает сессия приложения.
