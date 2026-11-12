# Plan

**Task:** RT-3180 · **Branch:** RT-3180-workspace-overlay-breakpoint
**Spec:** `docs/specs/ui-kit-v2/workspace-breakpoint/spec.md`
**Behaviour:** changes

Работа вне эпика. Кода приложений нет, правка лежит в пакете `projects/ui-kit-v2/`.

## Points

- **A:** на планшете 768 рабочий стол показывает одну колонку, сведения выезжают без затемнения.
- **This task reaches:** порог одной колонки задаётся входом, сведения открываются боковой панелью с затемнением.
- **Sign:** истории раздела `Organisms/Workspace/Breakpoint` в витрине второго кита.
- **Milestone G of the epic:** нет, работа вне эпика.
- **Metric:** нет: новая возможность, а не улучшение правила.

## Task footprint

| What  | Where                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/workspace-breakpoint/`                                                               |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/verifiability.md`                                       |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/workspace/`, `projects/ui-kit-v2/src/lib/platform/`                 |

## What counts as done

- Без входа порога рабочий стол ведёт себя как раньше.
- С входом порога на 768 список и середина стоят рядом.
- Сведения на 768 открываются боковой панелью заданной ширины с затемнением и кнопкой «Закрыть».
- Панель закрывают кнопка, щелчок по затемнению и Esc.
- На 375 вид прежний.
- Истории витрины показывают 768 и 375 в светлой и тёмной теме.
- Владелец одобрил кадр и витрину.

## Stages

### 1. Макет

- **Steps:**
    1. Нарисовать кадры рабочего стола на 768 в Figma
    2. Показать кадры владельцу и записать ответ
- **Readiness sign:** в `approvals.md` лежит строка «Макет» со словами владельца.
- **Verified by:** `grep -c 'Макет' docs/tasks/RT-3180-workspace-overlay-breakpoint/approvals.md` — число 1.

### 2. Код и тесты

- **Steps:**
    1. Добавить входы порога и ширины панели и счёт одной колонки
    2. Открывать сведения боковой панелью с кнопкой «Закрыть»
    3. Написать тесты порога, панели и стилей
- **Readiness sign:** наборы рабочего стола зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=components/workspace` — все наборы прошли.

### 3. Витрина и числа

- **Steps:**
    1. Добавить истории порога на 768 и 375
    2. Сравнить числа витрины с кадром
- **Readiness sign:** в `approvals.md` лежит строка «Совпадение» с равными числами.
- **Verified by:** `grep -c 'Совпадение' docs/tasks/RT-3180-workspace-overlay-breakpoint/approvals.md` — число 1.

### 4. Показ владельцу

- **Steps:**
    1. Показать витрину владельцу и записать ответ
- **Readiness sign:** в `approvals.md` лежат обе цитаты владельца.
- **Verified by:** `node tools/check-kit-approval.mjs` — отказов нет.

## What this work does not do

- Наполнение панели сведений — это шаблон приложения.
- Порог третьей колонки 1080 входом не становится.
- Выпуск кита: он общий для трёх задач и идёт после слияния этой.
