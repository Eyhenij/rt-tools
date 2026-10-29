# Plan

**Task:** RT-2987 · **Branch:** RT-2987-header-nav-backdrop
**Spec:** `docs/specs/ui-kit-v2/popover-backdrop/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                |
| ----- | ---------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/popover-backdrop/`             |
| Code  | `projects/ui-kit-v2/src/lib/components/popover/`     |
| Code  | `projects/ui-kit-v2/src/lib/components/page-header/` |

## What counts as done

- Поповер с `rtPopoverBackdropClass` ставит подложку под панель, нажатие по ней закрывает панель;
  без входа подложки нет; мобильное меню шапки открывается на затемнении цветом
  `--rt-color-bg-overlay`.

## Stages

### 1. Затемнение под мобильным меню шапки

- **Steps:**
    1. Вход `rtPopoverBackdropClass` в директиве поповера
    2. Бургер шапки включает подложку `rt-page-header-mobile-backdrop`
    3. Тесты SC-UKV-1070…1072
    4. Спек поддомена, привязка и описание поповера
- **Readiness sign:** тесты поповера и шапки проходят
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/popover projects/ui-kit-v2/src/lib/components/page-header` — «Tests: N passed», ни одного упавшего

## What this work does not do

- Подъём версии кита в приложении и проверка на телефоне там — задача приложения.
- Выпуск пакета в реестр — после слияния, по слову владельца.
