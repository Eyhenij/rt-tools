# Plan

**Task:** RT-2938 · **Branch:** RT-2938-chat-undelivered
**Spec:** `docs/specs/ui-kit-v2/chat-undelivered/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/chat-undelivered/`                                                                                                       |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                              |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                              |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`, `projects/ui-kit-v2/src/rich-editor/lib/pipes/`, `projects/ui-kit-v2/src/lib/i18n/` |

## What counts as done

- `ERtChatMessageStatus.Undelivered = 'undelivered'` есть, реплика с ним рисует значок предупреждения и подпись `rtKit.chatStatusUndelivered` под текстом, кнопки повтора нет.
- Тесты и витрина покрывают новый статус, снимки витрины пересняты.
- В Figma у «Chat Bubble» есть вариант `Status=undelivered`, пузыри ленты «Chat» шириной от ленты; библиотека опубликована — если правку дизайн-системы разрешит владелец.
- PR открыт и готов к слиянию; выпуска пакета в этой работе нет.

## Stages

### 1. Описание подраздела

- **Steps:**
    1. Записать описание `docs/specs/ui-kit-v2/chat-undelivered/` с правилами и сценариями
    2. Проверить описание проверкой описаний
- **Readiness sign:** проверка описаний не называет подраздел
- **Verified by:** `npm run check:specs` — код выхода 0

### 2. Статус в коде

- **Steps:**
    1. Добавить значение `undelivered` в перечисление и подпись в набор `rtKit`
    2. Нарисовать значок и подпись в шаблоне и стилях `rt-chat`
    3. Покрыть статус тестами `rt-chat` и пайпа подписи
- **Readiness sign:** тесты `rt-chat` и пайпа зелёные
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat` — все тесты прошли

### 3. Витрина и описания компонента

- **Steps:**
    1. Добавить статус в историю статусов чата и в описание компонента
    2. Переснять снимки витрины чата
- **Readiness sign:** снимки чата совпадают со вторым прогоном
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 --update 'chat-matrix'` — ни одного обновлённого во втором прогоне

### 4. Figma

- **Steps:**
    1. Сделать пузыри ленты «Chat» шириной от ленты
    2. Добавить вариант `Status=undelivered` у «Chat Bubble»
    3. Опубликовать библиотеку
- **Readiness sign:** на ширине 311 пузыри внутри ленты; библиотека без изменений после публикации
- **Verified by:** `npm run check:specs` — код выхода 0 (сама правка Figma проверяется измерением экземпляра)

### 5. Сдача

- **Steps:**
    1. Прогнать полный набор проверок
    2. Разобрать папку задачи и открыть PR
- **Readiness sign:** полный набор зелёный, PR открыт
- **Verified by:** `pnpm run check:all` — код выхода 0

## What this work does not do

- Выпуск `@rt-tools/ui-kit-v2` 0.32.0 — один раз вместе со знаком канала, по слову владельца.
- Кнопка повтора для `undelivered` — повтор записал бы ответ второй раз.
