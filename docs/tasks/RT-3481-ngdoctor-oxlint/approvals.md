# Одобрения правки кита

Правка `rt-toolbar.component.ts`, `rt-workspace-details.component.ts`, `rt-day-stamp.pipe.ts`,
`rt-pdf-viewer.component.ts` и `ai-chat-chart.schema.ts`: сравнения `== null` и `!= null` — через
`isNil` из utils, просмотрщик PDF обходит ключи словаря без копии, условия JSON Schema графиков
чата переписаны с `if`/`then` на `anyOf` и `not`.

- **Без вида:** «Подтверждаю, вид не меняется»

Смена JSON публичной схемы `RT_AI_CHAT_CHART_SCHEMA` — и вместе с ней схемы блока
`RT_AI_CHAT_CHART_BLOCK_SCHEMA`, которая встраивает её полем `spec`: «Подтверждаю смену JSON
(Recommended)».
