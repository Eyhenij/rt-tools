# Plan

**Task:** RT-3428 · **Branch:** RT-3428-aside-empty
**Draft:** `docs/specs/ui-kit-v2/proposed/aside-empty/`
**Behaviour:** changes

## Points

- **A:** пустая панель `rt-aside` показывает под шапкой белое поле без единого слова.
- **This task reaches:** панель с входом `empty` показывает по центру тела иконку и «нет данных»; приложение меняет их входами или своим шаблоном.
- **Sign:** история витрины «Aside / Empty» на порту 6007 — четыре вида пустой панели; тест `rt-aside-empty.spec.ts` зелёный.
- **Milestone G of the epic:** нет эпика — работа вне эпика по слову владельца.
- **Metric:** нет: у панели не было заглушки пустого содержимого.

## Task footprint

| What  | Where                                                          |
| ----- | -------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/` — новая подобласть `aside-empty`       |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/mockups.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/aside/`                 |

## What counts as done

- Панель с `empty` показывает `rt-empty-state` с иконкой `inbox` и подписью `uiNoData` вместо содержимого.
- Шапка, блок ошибки и подвал на месте при пустоте.
- Входы `emptyIcon`, `emptyTitle`, `emptyDescription` меняют заглушку; шаблон `rtAsideEmpty` заменяет её целиком.
- Витрина показывает все виды; макет и витрина одобрены владельцем.
- PR влит в `main`.

## Stages

### 1. Макет

- **Steps:**
    1. Нарисовать кадр пустой панели в Figma
    2. Получить одобрение макета владельцем
- **Readiness sign:** строка «Макет» в approvals.md с цитатой владельца.
- **Verified by:** `grep -c 'Макет' docs/tasks/RT-3428-aside-empty/approvals.md` — 1

### 2. Код и тесты

- **Steps:**
    1. Директива слота rtAsideEmpty
    2. Входы и заглушка в rt-aside
    3. Тест rt-aside-empty.spec.ts
- **Readiness sign:** тесты панели зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/aside --maxWorkers=2` — все тесты прошли

### 3. Витрина и тексты

- **Steps:**
    1. История пустой панели в витрине
    2. CONTEXT.md и Overview.mdx панели
    3. Одобрение витрины владельцем
- **Readiness sign:** строка «Витрина» в approvals.md.
- **Verified by:** `node tools/check-kit-approval.mjs` — без отказа

## What this work does not do

- Выпуск пакета: его делает сессия приложения.
- Правку панелей самих приложений.
