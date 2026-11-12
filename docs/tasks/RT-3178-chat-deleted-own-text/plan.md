# Plan

**Task:** RT-3178 · **Branch:** RT-3178-chat-deleted-own-text
**Spec:** `docs/specs/ui-kit-v2/chat-deleted-own/spec.md`
**Behaviour:** changes

Работа вне эпика. Кода приложений нет, правка лежит в пакете `projects/ui-kit-v2/`.

## Points

- **A:** подпись снятого своего сообщения в виде `messenger` белая на прозрачном пузыре и не читается.
- **This task reaches:** подпись, дата и знак статуса снятого своего сообщения приглушённые в обеих темах.
- **Sign:** история `DeletedOwnMessenger` чата в витрине второго кита и её эталон кадра.
- **Milestone G of the epic:** нет, работа вне эпика.
- **Metric:** нет: белый текст на прозрачном пузыре.

## Task footprint

| What  | Where                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/chat-deleted-own/`                                                                   |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/verifiability.md`                                       |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`                                                  |

## What counts as done

- У снятого своего сообщения в виде `messenger` подпись, дата и знак статуса не белые.
- История витрины показывает своё снятое сообщение в светлой и тёмной теме.
- Тест стилей ловит правило, которое красит снятое своё сообщение в белый.
- Владелец одобрил кадр и витрину.

## Stages

### 1. Макет

- **Steps:**
    1. Нарисовать кадр снятого своего сообщения в Figma
    2. Показать кадр владельцу и записать ответ
- **Readiness sign:** в `approvals.md` лежит строка «Макет» со словами владельца.
- **Verified by:** `grep -c 'Макет' docs/tasks/RT-3178-chat-deleted-own-text/approvals.md` — число 1.

### 2. Код и тесты

- **Steps:**
    1. Не давать цвет своего сообщения снятому
    2. Написать тест стилей и тест разметки
- **Readiness sign:** наборы чата зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rich-editor/lib/components/chat` — все наборы прошли.

### 3. Витрина и числа

- **Steps:**
    1. Добавить историю снятого своего сообщения
    2. Сравнить числа витрины с кадром и снять наложение
- **Readiness sign:** в `approvals.md` лежит строка «Совпадение» с равными числами.
- **Verified by:** `grep -c 'Совпадение' docs/tasks/RT-3178-chat-deleted-own-text/approvals.md` — число 1.

### 4. Показ владельцу

- **Steps:**
    1. Показать витрину владельцу и записать ответ
- **Readiness sign:** в `approvals.md` лежат обе цитаты владельца.
- **Verified by:** `node tools/check-kit-approval.mjs` — отказов нет.

## What this work does not do

- Подпись перевода у сообщения — задача RT-3179.
- Порог и боковая панель `rt-workspace` — задача RT-3180.
- Выпуск кита: он общий для трёх задач и идёт после слияния RT-3180.
