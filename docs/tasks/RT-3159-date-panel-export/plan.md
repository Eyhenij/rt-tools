# Plan

**Task:** RT-3159 · **Branch:** RT-3159-date-panel-export
**Spec:** `docs/specs/ui-kit-v2/date-panel/spec.md`
**Behaviour:** changes

Работа вне эпика. Кода приложений нет, правка лежит в пакете `projects/ui-kit-v2/`.

## Points

- **A:** панель даты стоит только внутри поля, файлы черновика чата снаружи не прочитать.
- **This task reaches:** потребитель пакета собирает выбор даты без текстового поля и знает, приложены ли файлы к черновику.
- **Sign:** импорт из `@rt-tools/ui-kit-v2/date-picker`, история `Molecules/Forms/DatePanel/Opened`, вызов `draftFiles()` в спеке чата.
- **Milestone G of the epic:** нет, работа вне эпика.

## Task footprint

| What  | Where                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/date-panel/`, `docs/specs/ui-kit-v2/chat-draft/`                                          |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/mockups.md`                                            |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/`                 |
| Code  | `projects/ui-kit-v2/src/lib/components/date-picker/`, `projects/ui-kit-v2/src/rich-editor/lib/components/chat/` |

## What counts as done

- `RtDatePanelComponent` импортируется из `@rt-tools/ui-kit-v2/date-picker`.
- `rt-chat` отвечает на `draftFiles()` выбранными файлами.
- История панели в поповере и в `rt-bottom-sheet` и тесты на месте.
- Вид панели и чата не изменился.

## Stages

### 1. Код и тесты

- **Steps:**
    1. Выдать панель из бареля и описать входы и выходы
    2. Добавить метод draftFiles в чат
    3. Написать сценарии и тесты
- **Readiness sign:** спеки зелёные, типы пакета собираются.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — все наборы прошли.

### 2. Витрина и документы

- **Steps:**
    1. Добавить историю панели в поповере и в шторке
    2. Обновить обзоры и спеки
- **Readiness sign:** история открывается, проверка документов зелёная.
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — расхождений нет.

### 3. Показ владельцу

- **Steps:**
    1. Снять числа панели и сверить с кадром
    2. Показать витрину и записать ответ
- **Readiness sign:** в `approvals.md` лежат слова владельца.
- **Verified by:** `node tools/check-kit-approval.mjs` — отказов нет.
