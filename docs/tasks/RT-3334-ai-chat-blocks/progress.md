# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 5 из 5 — Сверка с макетом, сделан
- **Done:** макет и витрина одобрены («Одобряю» оба раза), совпадение 50 из 50 чисел. Модель `UserMessage | AssistantMessage` с `blocks`, логика
  `toBlockViews` и `blocksToPlainText`, реестр `RT_AI_CHAT_BLOCK_RENDERERS` и
  `provideRtAiChatBlock`, компонент `rt-ai-chat-blocks`, ответ и фикстуры переведены на блоки.
  Подпись `aiBlockUnsupported` (en и ru витрины). Спеки кита: 3725 из 3725, типы спек сходятся.
  Спек `ai-chat`: 3 новых правила, сценарии SC-UKV-1308…1312, `check:specs` зелёный.
  `CONTEXT.md`, `Overview.mdx`, история `Organisms/Chat/AiChat` → `Blocks`. Сборка кита зелёная.
- **Next step:** закрытие задачи (`task-flow-close`): тексты домена, набор перед отправкой, разбор
  папки, PR в ветку эпика `RT-3346-ai-chat-blocks`. Отправка ветки — после слияния PR 3349 и
  слияния `main` в ветку эпика.
- **Uncommitted:** нет.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Нарисовать в Figma ответ с блоками `markdown` и `notice` всех severity
- [x] 1.2 Показать владельцу ссылку на кадр и записать одобрение в `approvals.md`
- [x] 2.1 Описать `UserMessage`, `AssistantMessage` и `Block` в `rt-ai-chat.model.ts`
- [x] 2.2 Написать `blocksToPlainText` в `blocks/rt-ai-chat-blocks.logic.ts` со спекой
- [x] 3.1 Написать `rt-ai-chat-blocks` с `@switch` по типу
- [x] 3.2 Встроить его в `rt-ai-chat-answer` и перевести `isWritten` и копирование на блоки
- [x] 3.3 Перевести `rt-ai-chat.component.spec.ts` и фикстуры историй на `blocks`
- [x] 4.1 Дописать правила и сценарии в спек `ai-chat`, убрать строку о том, что чат не знает вложений
- [x] 4.2 Обновить `CONTEXT.md` и `Overview.mdx`
- [x] 4.3 Добавить историю с каждым типом блока и с неизвестным типом
- [x] 5.1 Замерить витрину против кадра Figma и записать число совпадения
- [x] 5.2 Показать витрину владельцу и записать второе одобрение

## Decisions along the way

- **Тяжёлые блоки подключаются реестром через DI-токен** — ответ запустившей сессии на вопрос из
  разбора («спроси совета у соседней сессии»): `markdown` и `notice` встроены, остальные типы
  регистрирует `provideRtAiChat…Block()` в своём secondary entry, график — рядом с `rt-chart`, echarts
  там необязательная зависимость. Статический `@switch` с `@defer` отвергнут: импорт `rt-chart` из
  rich-editor делает echarts зависимостью для всех, кто берёт редактор. Шаг 3.1 пишет `@switch` для
  двух встроенных типов и ветку реестра для остальных. Affected stage of the plan: 3.
- **Неизвестный тип блока рисуется видимой заглушкой, а не пропускается** — тот же ответ: пропуск
  прячет от разработчика забытую регистрацию отрисовщика. Тип блока — открытое объединение. Заглушка
  входит в макет шага 1.1; `blocksToPlainText` неизвестный тип по-прежнему пропускает. Affected stage
  of the plan: 1, 3, 4.

- **Отступ заглушки 8/16 вместо 10/12 макета** — у кита нет токенов 10 и 12 px, а стили берут
  только токены; кадры 8061:2255 и 8062:2078 в Figma переведены на 8/16 после одобрения. Владельцу
  сказать при показе витрины. Affected stage of the plan: 5.
- **Высота строки заглушки — `--rt-leading-snug` (1,35), как в макете** — замер 5.1 показал 18 px
  при `leading-normal` против 16,2 в кадре. Высота заглушки в число не входит: Figma округляет
  текстовый слой 16,2 до 16 и даёт 34 вместо 34,2. Строка хода работы `rt-ai-run-status` выше копии
  Figma на 1,9 px (22,9 против 21) — старый компонент, вне этой задачи. Affected stage of the plan: 5.
- **Вид блока собирает чистая функция `toBlockViews`** — объединение с `type: string` не сужается в
  шаблоне по `@switch`; шаблон выбирает по полю `kind` готового вида. Affected stage of the plan: 3.

## Sessions

### 2026-11-15

- Папка задачи получила progress; работа продолжена в рабочем дереве `ai-chat-blocks`.
- Макет: 4 панели на странице «AI Chat». Копия `rt-message` сверена со стилями кода: отступ 16,
  промежуток 8, скругление 8, шрифт 14, высота строки 1.5 — совпадает.
- Код этапов 2–3: спеки `rt-ai-chat-blocks` 7 из 7, все спеки кита 3725 из 3725; `tsc` по
  `tsconfig.spec.json` без ошибок; eslint и stylelint по папке чата чистые. Сборка кита (проверка
  типов шаблонов) ещё не гонялась.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3334-ai-chat-blocks

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 из 5 — Сверка с макетом
- **Next step:** шаг 5.1 — поднять витрину, открыть `Blocks`, замерить против кадров 8061:2096 и
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3334-ai-chat-blocks/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/ai-chat/implementation.md
 M docs/specs/ui-kit-v2/ai-chat/scenarios.md
 M docs/specs/ui-kit-v2/ai-chat/spec.md
 M projects/ui-kit-v2/.storybook/showcase-labels.ru.ts
 M projects/ui-kit-v2/src/lib/components/page-header/stories/component/test-page-header-vertical.data.ts
 M projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/CONTEXT.md
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/Overview.mdx
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.html
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.scss
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/index.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.component.spec.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.component.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/rt-ai-chat.model.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/ai-chat-matrix.stories.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/ai-chat.fixture.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/test-ai-chat-matrix.component.html
 M projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/stories/component/test-ai-chat-matrix.component.ts
?? docs/tasks/RT-3334-ai-chat-blocks/approvals.md
```

### Commits over the main branch

```
548494a86 docs(rt:ui-kit-v2): разбор и план задачи RT-3334
1c525d51f docs(rt:ui-kit-v2): план эпика RT-3346 — блоки ответа rt-ai-chat
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
