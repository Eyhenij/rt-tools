# Plan

**Task:** RT-3267 · **Branch:** RT-3267-workspace-overlay-header
**Spec:** `docs/specs/ui-kit-v2/workspace-breakpoint/spec.md`
**Behaviour:** changes

## Points

- **A:** панель сведений `rt-workspace` поверх окна идёт без шапки: вкладки у верхнего края, нет
  ни названия записи, ни стрелки назад.
- **This task reaches:** у панели шапка со стрелкой назад, надписью «Сведения» и заголовком из
  нового входа `asideTitle`.
- **Sign:** история витрины на 768 со шапкой; число совпадений `kit-match` с кадром Figma; версия
  кита в npm.
- **Milestone G of the epic:** нет, работа вне эпика.
- **Metric:** нет: у панели не было шапки из одобренного кадра приложения.

## Task footprint

| What  | Where                                                                                  |
| ----- | -------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/workspace-breakpoint/`                                           |
| Laws  | `docs/constitution/mockups.md`, `frontend-application.md`                              |
| Rules | `.claude/skills/kit-approval/`, `rt-tools-storybook/`                                  |
| Code  | `projects/ui-kit-v2/src/lib/components/workspace/`, `projects/ui-kit-v2/src/lib/i18n/` |

## What counts as done

- У `rt-workspace` вход `asideTitle: string | null`; панель поверх окна рисует `rt-aside-header`
  с надзаголовком `uiAsideDetails` и этим заголовком; без заголовка шапка стоит.
- Стрелка шапки закрывает панель, `asideOpen()` после неё `false`.
- Витрина совпадает с кадром Figma по числам; оба одобрения владельца в `approvals.md`.
- Новая версия `@rt-tools/ui-kit-v2` опубликована в npm.

## Stages

### 1. Макет

- **Steps:**
    1. Добавить шапку в кадр рабочего стола 768 в файле кита
    2. Получить одобрение макета
- **Readiness sign:** в `approvals.md` строка «Макет» со словами владельца.
- **Verified by:** `grep -c "Макет" docs/tasks/RT-3267-workspace-overlay-header/approvals.md` — 1.

### 2. Код и витрина

- **Steps:**
    1. Вход asideTitle, шапка в панели, подпись uiAsideDetails
    2. Спеки панели поверх окна
    3. История витрины с шапкой и сверка чисел с кадром
    4. Описание workspace-breakpoint и CONTEXT.md
    5. Получить одобрение витрины
- **Readiness sign:** спеки зелёные, `kit-match numbers` без расхождений, строка «Витрина» в
  `approvals.md`.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-workspace-breakpoint.spec.ts` — все тесты прошли.

### 3. Поставка

- **Steps:**
    1. Набор перед push, PR, слияние
    2. Выпуск minor и проверка версии в npm
- **Readiness sign:** `npm view @rt-tools/ui-kit-v2 version` выдаёт новую версию.
- **Verified by:** `npm view @rt-tools/ui-kit-v2 version` — версия выше 0.43.0.

## What this work does not do

- Не меняет вид `rt-aside-header` сам по себе, ширину панели, затемнение и вид на телефоне.
- Не добавляет ключ `rtKit.uiAsideDetails` в словари приложения: это делает приложение.
