# Plan

**Task:** RT-2639 · **Branch:** RT-2639-chat-header-title-wrap
**Spec:** `projects/ui-kit-v2/src/lib/components/toolbar/CONTEXT.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                      |
| ----- | ---------------------------------------------------------- |
| Specs | `projects/ui-kit-v2/src/lib/components/toolbar/CONTEXT.md` |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/testing/`   |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/`           |

## What counts as done

- В плотной полосе длинный заголовок левого слота переносится и не выходит за правый край полосы.
- Кнопки правого слота плотной полосы стоят справа и не сжимаются.
- Обычная полоса раскладывается как раньше.

## Stages

### 1. Правка плотной полосы

- **Steps:**
    1. Левая полоса плотного вида сжимается
    2. Тест полосы на длинный заголовок
    3. Описание плотного вида в CONTEXT.md
- **Readiness sign:** тест полосы зелёный, линтеры стилей и кода без замечаний.
- **Verified by:** `pnpm exec nx test ui-kit-v2 --testFile=rt-toolbar.component.spec.ts` — все тесты файла прошли

## What this work does not do

- Выпуск новой версии пакета: его делает владелец после слияния.
- Деньги правой панели переписки: задача RT-2637.
