# Plan

**Task:** RT-3179 · **Branch:** RT-3179-chat-translation-caption
**Spec:** `docs/specs/ui-kit-v2/chat-translation/spec.md`
**Behaviour:** changes

Работа вне эпика. Кода приложений нет, правка лежит в пакете `projects/ui-kit-v2/`.

## Points

- **A:** у реплики чата нет подписи перевода и кнопки, которая возвращает перевод.
- **This task reaches:** реплика показывает подпись перевода у времени и кнопку «Показать перевод».
- **Sign:** история `BothLooks` раздела перевода чата в витрине второго кита.
- **Milestone G of the epic:** нет, работа вне эпика.
- **Metric:** нет: новая возможность, а не улучшение правила.

## Task footprint

| What  | Where                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/chat-translation/`                                                                   |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/verifiability.md`                                       |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`                                                  |

## What counts as done

- Реплика с подписью перевода показывает её в строке времени перед временем.
- Реплика с признаком кнопки показывает «Показать перевод», нажатие уходит событием `showTranslation`.
- Реплика без новых полей выглядит как раньше.
- История витрины показывает три состояния в обоих видах и обеих темах.
- Владелец одобрил кадр и витрину.

## Stages

### 1. Макет

- **Steps:**
    1. Нарисовать кадр перевода реплики в Figma
    2. Показать кадр владельцу и записать ответ
- **Readiness sign:** в `approvals.md` лежит строка «Макет» со словами владельца.
- **Verified by:** `grep -c 'Макет' docs/tasks/RT-3179-chat-translation-caption/approvals.md` — число 1.

### 2. Код и тесты

- **Steps:**
    1. Добавить поля реплики, выход чата и подпись кнопки
    2. Вывести подпись и кнопку в шаблоне и написать стили кнопки
    3. Написать тесты подписи, кнопки и стилей
- **Readiness sign:** наборы чата зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rich-editor/lib/components/chat` — все наборы прошли.

### 3. Витрина и числа

- **Steps:**
    1. Добавить историю перевода в обоих видах
    2. Сравнить числа витрины с кадром
- **Readiness sign:** в `approvals.md` лежит строка «Совпадение» с равными числами.
- **Verified by:** `grep -c 'Совпадение' docs/tasks/RT-3179-chat-translation-caption/approvals.md` — число 1.

### 4. Показ владельцу

- **Steps:**
    1. Показать витрину владельцу и записать ответ
- **Readiness sign:** в `approvals.md` лежат обе цитаты владельца.
- **Verified by:** `node tools/check-kit-approval.mjs` — отказов нет.

## What this work does not do

- Сам перевод и пункт меню «Показать оригинал» — это делает приложение.
- Порог и боковая панель `rt-workspace` — задача RT-3180.
- Выпуск кита: он общий для трёх задач и идёт после слияния RT-3180.
