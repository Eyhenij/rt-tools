# Чем исполняется — действия у реплики переписки

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Своё действие у реплики потребитель объявляет шаблоном, а не правкой кита.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.directive.ts:RtChatMessageActionsDirective`; сценарий `SC-UKV-73`
- **Видимость точки действий держит предикат потребителя, а не подсчёт отрисованных пунктов.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.pipe.ts:RtChatMessageHasActionsPipe`; сценарий `SC-UKV-75`
- **Предикат не задан — точка действий показывается.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat-message-actions.logic.ts:messageHasAvailableActions`; сценарий `SC-UKV-76`
- **Шаблон не объявлен — разметка реплики прежняя.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat.component.ts:messageActions` — вывод точки действий стоит под условием захваченного шаблона; сценарий `SC-UKV-74`
- **Точечные действия остаются на месте.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat.component.ts:deleteMessage` — удаление, повтор и скачивание остались своими выходами кита; сценарий `SC-UKV-74`
- **Действие потребителя моделью реплики не описывается.** — `projects/ui-kit-v2/src/lib/components/chat/rt-chat.model.ts:MessageActionsPredicate` — в модели стоит признак, а не действие; сценарий `SC-UKV-73`
