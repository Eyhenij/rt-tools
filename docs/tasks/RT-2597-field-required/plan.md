# Plan

**Task:** RT-2597 · **Branch:** RT-2597-field-required
**Spec:** `projects/ui-kit-v2/src/lib/components/field/CONTEXT.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Docs  | `projects/ui-kit-v2/src/lib/components/field/CONTEXT.md`        |
| Rules | `.claude/skills/component-structure/`, `testing`                |
| Code  | `projects/ui-kit-v2/src/lib/components/field/`, `form-control/` |

## What counts as done

- `<rt-field label="Имя" required>` с контролом на `ngModel` рисует «*».
- Тронутое пустое такое поле показывает ошибку «Обязательное поле» и красную рамку контрола.
- Поле с `Validators.required` ведёт себя как раньше.

## Stages

### 1. Вход и база

- **Steps:**
    1. База контрола получает сеттер обязательности и складывает его с валидатором формы
    2. Поле получает вход `required` и пробрасывает его в контрол
    3. Тесты поля на шаблонной форме: звёздочка, ошибка после касания, снятие ошибки по значению
- **Readiness sign:** новые тесты зелёные, прежние не тронуты.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-field.component.spec.ts` — все тесты прошли.

### 2. Описание и витрина

- **Steps:**
    1. Описание поля называет вход `required`
    2. История витрины показывает обязательное поле шаблонной формы
- **Readiness sign:** описание и витрина говорят о входе.
- **Verified by:** `pnpm exec nx lint @rt-tools/ui-kit-v2` — без ошибок.

## What this work does not do

- Не делает форму недействительной: решение о записи остаётся у формы.
