# Plan

**Task:** RT-3334 · **Branch:** RT-3334-ai-chat-blocks
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Points

- **A:** ответ `rt-ai-chat` — строка `text` в markdown; остальное рисует шаблон приложения.
- **This task reaches:** ответ рисуется массивом `blocks` из блоков `markdown` и `notice`, неизвестный
  тип пропущен, копирование берёт текст всех блоков.
- **Sign:** история витрины `Rich editor/AI chat` с каждым типом блока и с неизвестным типом; юнит-тест
  `blocksToPlainText`; видит владелец в витрине.
- **Milestone G of the epic:** опубликованная версия кита рисует ответ «обзор месяца» одним массивом
  `blocks` без шаблона приложения.
- **Metric:** нет: новая возможность кита, не правка правила.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                               |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/component-structure/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`  |

## What counts as done

- `IRtAiChat.Message` = `UserMessage | AssistantMessage`; у ответа `blocks: readonly Block[]`, `Block` =
  `markdown | notice`.
- `rt-ai-chat-blocks` рисует блоки по порядку, неизвестный тип пропускает.
- `blocksToPlainText` склеивает текст блоков и пропускает неизвестные; кнопка копирования ответа
  берёт его.
- Спек, `CONTEXT.md`, `Overview.mdx`, истории и спеки компонента переведены на `blocks`.
- В `approvals.md` записаны оба одобрения: макет и витрина.

## Stages

### 1. Макет

- **Steps:**
    1. Нарисовать в Figma ответ с блоками `markdown` и `notice` всех severity
    2. Показать владельцу ссылку на кадр и записать одобрение в `approvals.md`
- **Readiness sign:** в `approvals.md` есть строка макета с цитатой владельца.
- **Verified by:** `grep -c '^- \*\*Макет:\*\*' docs/tasks/RT-3334-ai-chat-blocks/approvals.md` — `1`

### 2. Модель и копирование

- **Steps:**
    1. Описать `UserMessage`, `AssistantMessage` и `Block` в `rt-ai-chat.model.ts`
    2. Написать `blocksToPlainText` в `blocks/rt-ai-chat-blocks.logic.ts` со спекой
- **Readiness sign:** спека `blocksToPlainText` зелёная, типы собираются.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-ai-chat-blocks.logic.spec.ts` — `Tests:` без `failed`

### 3. Отрисовка

- **Steps:**
    1. Написать `rt-ai-chat-blocks` с `@switch` по типу
    2. Встроить его в `rt-ai-chat-answer` и перевести `isWritten` и копирование на блоки
    3. Перевести `rt-ai-chat.component.spec.ts` и фикстуры историй на `blocks`
- **Readiness sign:** спеки папки `ai-chat` зелёные, кит собирается.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=ai-chat` — `Tests:` без `failed`

### 4. Тексты и витрина

- **Steps:**
    1. Дописать правила и сценарии в спек `ai-chat`, убрать строку о том, что чат не знает вложений
    2. Обновить `CONTEXT.md` и `Overview.mdx`
    3. Добавить историю с каждым типом блока и с неизвестным типом
- **Readiness sign:** проверка спеков зелёная.
- **Verified by:** `npm run check:specs` — код выхода `0`

### 5. Сверка с макетом

- **Steps:**
    1. Замерить витрину против кадра Figma и записать число совпадения
    2. Показать витрину владельцу и записать второе одобрение
- **Readiness sign:** в `approvals.md` есть строки совпадения и витрины.
- **Verified by:** `grep -c '^- \*\*Витрина:\*\*' docs/tasks/RT-3334-ai-chat-blocks/approvals.md` — `1`

## What this work does not do

- Блоки `chart`, `table`, `kpi`, `link`, `sources`, `section` — задачи RT-3335, RT-3337…RT-3340,
  RT-3342 эпика RT-3346.
- Выпуск кита — после RT-3337.
