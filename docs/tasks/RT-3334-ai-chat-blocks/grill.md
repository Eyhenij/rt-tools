# Grill

## The owner request

> Задача: перенести отрисовку содержимого ответа AI-чата в кит — `rt-ai-chat` из `@rt-tools/ui-kit-v2/rich-editor`. На доске Rt-tools (GitHub project 14) заведены issue RT-3334…RT-3344, все в Backlog с меткой `feature`.
>
> 1. RT-3334 — модель блоков в `IRtAiChat.Message`. От неё зависят остальные.

Задачу поставила запустившая сессия, текст выше дословный. Тело задачи RT-3334 переписано по слову
владельца «Переписать issue».

## What the tree already has

- `rt-ai-chat` лежит в `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`. Ответ рисует
  внутренний `rt-ai-chat-answer`, копирование — внутренний `rt-ai-chat-copy`. Видимый текст ответа
  получается через `markdownToPlainText` кита.
- `IRtAiChat.Message` несёт `text`, `run`, `streaming`, `feedback`. Вложения рисует шаблон
  приложения `rtAiChatMessageExtra`.
- Спек — `docs/specs/ui-kit-v2/ai-chat/`. Строка «Charts: the panel does not know what the
  attachments are» стоит в разделе о том, чего часть не делает.
- `rt-message` принимает `severity` из `IRtTag.Severity`. `rt-note` — тихая сноска без severity.
- `rt-chart` и `echarts` в ките нет (RT-2750 не начата).
- Номера сценариев кита общие, последний — SC-UKV-1303; 762 и 763 заняты.

## What the rules already say

- `kit-approval`: видимая правка кита начинается с макета в Figma и одобрения владельца, затем код,
  витрина, замер совпадения и второе одобрение.
- `epic-flow`: серия задач объявляется эпиком — заведён RT-3346, ветки задач стопкой.

## Questions and answers

**Какие типы блоков RT-3334 рисует сам?** Варианты: «markdown и notice» / «Все 7 типов сразу» /
«Все типы, рисует 2».
«markdown и notice»

**Как уживаются `text` и `blocks`?** Варианты: «text остаётся» / «blocks заменяет text».
«blocks заменяет text»

**На чём рисовать `notice`?** Варианты: «rt-message» / «rt-note».
«rt-message»

**Как подключать тяжёлые блоки, чтобы echarts не стал обязательным?** Варианты: «Реестр через DI» /
«Статический @switch».
«спроси совета у соседней сессии» — вопрос отправлен запустившей сессии, ответа нет.

**Что делать с issue RT-3334, критерий которого PR не выполнит?** Варианты: «Переписать issue» /
«Держать открытой».
«Переписать issue (Recommended)»

**Когда выпускать кит?** Варианты: «После 3337 + в конце» / «Один в конце».
«После 3337 + в конце (Recommended)»

**Одобряете план RT-3334?** Варианты: «Одобряю» / «Ждать совета про echarts».
«Одобряю (Recommended)»

## Decisions

- **`Message` делится на `UserMessage` и `AssistantMessage`** — следствие «blocks заменяет text»:
  вопрос остаётся строкой. Отвергнуто: `blocks` у вопроса — пузырь вопроса не markdown.
- **`rt-ai-chat-blocks` получает вход `blocks`, а не сообщение** — под вложенность секции RT-3342.
- **`blocksToPlainText` принимает `readonly { type: string }[]`** — неизвестный тип проверяется без
  приведения.
- **Ломающее изменение — подвалом `BREAKING CHANGE:` в коммите** — `CHANGELOG` пишет конвейер
  выпуска. Отвергнуто: правка `CHANGELOG` руками.

## What is left unclear

- Подключение тяжёлых блоков — ждёт совета запустившей сессии. RT-3334 не блокирует: здесь только
  `markdown` и `notice`, вход отрисовщика выбирается под оба варианта.
