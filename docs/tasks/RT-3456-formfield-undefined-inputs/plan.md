# Plan

**Task:** RT-3456 · **Branch:** RT-3456-formfield-undefined-inputs
**Spec:** `docs/specs/ui-kit-v2/signal-forms/spec.md`
**Behaviour:** changes

## Points

- **A:** `rt-date-picker`, `rt-date-range`, `rt-input-number` и `rt-autocomplete` с `[formField]`
  не собираются у потребителя: TS2322 на входах ограничений.
- **This task reaches:** все контролы кита собираются с `[formField]` из `@angular/forms/signals`,
  значение уходит в модель формы; с прежней привязкой и с `null` всё как было.
- **Sign:** проба `ngc` со `strictTemplates` на хосте из семи контролов — ноль ошибок; новая версия
  в `npm view @rt-tools/ui-kit-v2 versions --json`.
- **Milestone G of the epic:** вне эпика — работа по поручению.
- **Metric:** нет: починка, сломана сборка шаблона с `[formField]`.

## Task footprint

| What  | Where                                                                            |
| ----- | -------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/signal-forms/`                                             |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/testing/`, `.claude/skills/package-release/` |
| Code  | `projects/ui-kit-v2/src/lib/components/{date-picker,date-range,input-number,autocomplete}/` |

## What counts as done

- Входы `min`, `max` у `rt-date-picker`, `rt-date-range`, `rt-input-number` и `minLength` у
  `rt-autocomplete` принимают `undefined`; внутри контрола значение читается как прежде.
- На каждый из четырёх — спека с хостом `form(model)` и `[formField]`: значение уходит в модель, тип
  записи входа принимает `undefined`.
- Проба `ngc` со `strictTemplates` на семи контролах — ноль TS2322.
- PR в `main` влит, патч-версия кита опубликована и видна в npm.

## Stages

### 1. Спек

- **Steps:**
    1. Правило и сценарии `SC-UKV-1541`…`SC-UKV-1544` в спеке сигнальных форм
- **Readiness sign:** правило и сценарии лежат в спеке и в `implementation.md`
- **Verified by:** `node tools/check-specs.mjs` — нет строк про `signal-forms`

### 2. Входы и спеки

- **Steps:**
    1. Тип записи `min`, `max` у `rt-date-picker` и `rt-input-number`, `minLength` у `rt-autocomplete`
    2. Тип записи `min`, `max` у `rt-date-range` со значением диапазона
    3. Спеки четырёх контролов с `form(model)` и `[formField]`
- **Readiness sign:** спеки зелёные, типы сходятся
- **Verified by:** `pnpm exec nx run-many -t test typecheck lint -p @rt-tools/ui-kit-v2` — все цели зелёные

### 3. Живая проверка

- **Steps:**
    1. Проба `ngc` со `strictTemplates` на хосте из семи контролов
    2. Сборка пакета и витрина
- **Readiness sign:** ноль TS2322, пакет собран, витрина поднимается
- **Verified by:** `pnpm run build:ui-kit-v2` — сборка без ошибок

### 4. Ревью и сдача

- **Steps:**
    1. Первый круг ревью и правки
    2. Второй круг ревью и правки
    3. Набор перед отправкой, отправка, PR в `main`
    4. Слияние после зелёного прогона
    5. Выпуск патч-версии и сверка с npm
- **Readiness sign:** PR влит, версия в npm
- **Verified by:** `npm view @rt-tools/ui-kit-v2 versions --json` — новая патч-версия в конце списка

## What this work does not do

- Не трогает `step` у `rt-input-number`: FormField его не заполняет.
- Не правит `rt-input`, `rt-select`, `rt-textarea`: входов, которые заполняет FormField, у них нет.
